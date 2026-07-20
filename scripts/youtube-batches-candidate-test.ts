import { YOUTUBE_GRADE6_10_BATCH1_CANDIDATES as b1 } from "../src/lib/data/youtube-grade6-10-batch1-candidates";
import { YOUTUBE_GRADE6_10_BATCH2_CANDIDATES as b2 } from "../src/lib/data/youtube-grade6-10-batch2-candidates";
import { KICD_YOUTUBE_VIDEO_SEEDS } from "../src/lib/data/kicd-youtube-learning-library";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART2 } from "../src/lib/data/kicd-youtube-learning-library-part2";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART3 } from "../src/lib/data/kicd-youtube-learning-library-part3";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART4 } from "../src/lib/data/kicd-youtube-learning-library-part4";
const rows=[...b1,...b2],existing=new Set([...KICD_YOUTUBE_VIDEO_SEEDS,...KICD_YOUTUBE_VIDEO_SEEDS_PART2,...KICD_YOUTUBE_VIDEO_SEEDS_PART3,...KICD_YOUTUBE_VIDEO_SEEDS_PART4].map(v=>v.youtubeId)),ids=new Set(rows.map(v=>v.youtubeId)),failures:string[]=[];
if(b1.length!==50||b2.length!==50||rows.length!==100)failures.push("batch count mismatch");if(ids.size!==100)failures.push("duplicate candidate IDs");for(const row of rows){if(!/^[A-Za-z0-9_-]{11}$/.test(row.youtubeId))failures.push(`invalid ID ${row.youtubeId}`);if(existing.has(row.youtubeId))failures.push(`already seeded ${row.youtubeId}`);if(row.reviewStatus!=="CANDIDATE")failures.push(`premature approval ${row.youtubeId}`);}console.log({batch1:b1.length,batch2:b2.length,total:rows.length,uniqueIds:ids.size,failures});if(failures.length)process.exit(1);
