import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";

const downloads = [
  {
    id: 1,
    thumbnail: "https://picsum.photos/seed/401/100/120",
    name: "AI Productivity Planner",
    type: "Ebook",
    date: "2024-07-21",
  },
  {
    id: 2,
    thumbnail: "https://picsum.photos/seed/402/100/120",
    name: "Beginner's Guide to DeFi",
    type: "Course Script",
    date: "2024-07-20",
  },
  {
    id: 3,
    thumbnail: "https://picsum.photos/seed/403/100/120",
    name: "Mindfulness Journal",
    type: "Journal",
    date: "2024-07-18",
  },
];

export default function DownloadsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Downloads</h1>
        <p className="text-muted-foreground">Access your saved and generated digital products.</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Thumbnail</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downloads.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.thumbnail}
                    alt={item.name}
                    width={50}
                    height={60}
                    className="rounded-sm object-cover"
                    data-ai-hint="book cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate Cover
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
