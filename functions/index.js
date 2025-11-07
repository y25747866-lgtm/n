/**
 * Google Trends → Firestore Sync (Boss OS)
 * Author: Yesh
 * Runs every 3 hours and updates trending_topics collection
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const googleTrends = require("google-trends-api");
const slugify = require("slugify");

admin.initializeApp();
const db = admin.firestore();
const TOP_N = 20;

function makeId(title) {
  return slugify(title, { lower: true, strict: true });
}

async function fetchGoogleTrendsDaily() {
  try {
    const trending = await googleTrends.trendingSearches({ geo: 'US' });
    const parsed = typeof trending === 'string' ? JSON.parse(trending) : trending;
    const top = parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
    return top.slice(0, TOP_N).map((t, i) => {
      const title = t?.title?.query || (typeof t === 'string' ? t : '');
      return { title, score: 100 - i * 3 };
    });
  } catch (e) {
    console.error("Error fetching Google Trends:", e.message);
    return [];
  }
}

exports.syncGlobalTrendsToFirestore = functions.pubsub
  .schedule('every 3 hours')
  .timeZone('UTC')
  .onRun(async () => {
    console.log("Starting Google Trends Sync...");
    const items = await fetchGoogleTrendsDaily();
    if (!items.length) {
      console.log("No trending data found.");
      return null;
    }

    const batch = db.batch();
    const nowISO = new Date().toISOString();

    for (const it of items) {
      const id = makeId(it.title);
      const docRef = db.collection('trending_topics').doc(id);
      const keywords = it.title
        .replace(/[^\w\s]/gi, ' ')
        .split(/\s+/)
        .map(w => w.toLowerCase())
        .filter(Boolean);

      batch.set(docRef, {
        title: it.title,
        keywords,
        trend_score: it.score,
        source: 'google_trends',
        last_updated: nowISO
      }, { merge: true });
    }

    await batch.commit();
    console.log(`✅ Synced ${items.length} topics to Firestore.`);
    return null;
  });