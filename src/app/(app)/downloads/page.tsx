
'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

const gradientStops = [
  'from-red-500 to-yellow-500',
  'from-green-400 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-rose-400 to-red-500',
  'from-lime-400 to-green-500',
];

export default function DownloadsPage() {
  const auth = useAuth();
  const firestore = useFirestore();

  const [user, isUserLoading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      signInAnonymously(auth).catch((err) => console.error("Anon sign-in error:", err));
    }
  }, [isUserLoading, user, auth]);

  const trendingQuery = useMemo(() => {
    if (isUserLoading || !user) return null;
    return query(
      collection(firestore, "trending_topics"),
      orderBy("usage_count", "desc"),
      limit(10)
    );
  }, [isUserLoading, user, firestore]);

  const [trendingData, trendingLoading, trendingError] = useCollection(trendingQuery);

  useEffect(() => {
    if (!isUserLoading && !trendingLoading) {
      setIsLoading(false);
    }
  }, [isUserLoading, trendingLoading]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg mt-4">Loading trending topics...</p>
      </div>
    );
  }

  if (trendingError) {
    console.error("Firestore Error:", trendingError);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-destructive text-lg">
          Failed to load trending topics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">🔥 Trending E-Book Topics</h1>

      {trendingData?.docs?.length === 0 && (
        <p className="text-center text-muted-foreground">No trending topics yet. Create a product to see what's hot!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingData?.docs?.map((doc, index) => {
          const topic = doc.data();
          return (
            <Card
              key={doc.id}
              className={`relative flex flex-col overflow-hidden text-white bg-gradient-to-br ${gradientStops[index % gradientStops.length]}`}
            >
              <CardHeader className="flex-1">
                <CardTitle className="text-2xl font-bold">
                  {topic.topic}
                </CardTitle>
              </CardHeader>
              <CardFooter className="z-10 flex items-center justify-between bg-black/20 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Flame className="h-4 w-4" />
                  <span>{topic.usage_count?.toLocaleString() || 0} creators used this</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}
