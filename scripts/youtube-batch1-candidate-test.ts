import { YOUTUBE_GRADE6_10_BATCH1_CANDIDATES as rows } from "../src/lib/data/youtube-grade6-10-batch1-candidates";
import { KICD_YOUTUBE_VIDEO_SEEDS } from "../src/lib/data/kicd-youtube-learning-library";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART2 } from "../src/lib/data/kicd-youtube-learning-library-part2";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART3 } from "../src/lib/data/kicd-youtube-learning-library-part3";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART4 } from "../src/lib/data/kicd-youtube-learning-library-part4";
const existing=new Set([...KICD_YOUTUBE_VIDEO_SEEDS,...KICD_YOUTUBE_VIDEO_SEEDS_PART2,...KICD_YOUTUBE_VIDEO_SEEDS_PART3,...KICD_YOUTUBE_VIDEO_SEEDS_PART4].map(v=>v.youtubeId));
const ids=new Set(rows.map(v=>v.youtubeId));
const counts=Object.fromEntries(["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g=>[g,rows.filter(v=>v.grade===g).length]));
const failures:string[]=[];
if(rows.length!==50)failures.push(`count=${rows.length}`);
if(ids.size!==rows.length)failures.push("duplicate candidate IDs");
for(const row of rows){if(!/^[A-Za-z0-9_-]{11}$/.test(row.youtubeId))failures.push(`invalid ID ${row.youtubeId}`);if(existing.has(row.youtubeId))failures.push(`already seeded ${row.youtubeId}`);if(row.reviewStatus!=="CANDIDATE")failures.push(`premature approval ${row.youtubeId}`);}
console.log({count:rows.length,uniqueIds:ids.size,gradeCounts:counts,failures});
if(failures.length)process.exit(1);
