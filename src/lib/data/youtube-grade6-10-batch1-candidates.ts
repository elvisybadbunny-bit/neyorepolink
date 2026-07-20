export interface VideoReviewCandidate { youtubeId:string; grade:string; subject:string; title:string; reviewStatus:"CANDIDATE"; sourceCheckedOn:string; }
const make=(grade:string,subject:string,items:[string,string][]):VideoReviewCandidate[]=>items.map(([youtubeId,title])=>({youtubeId,grade,subject,title,reviewStatus:"CANDIDATE",sourceCheckedOn:"2026-07-20"}));
export const YOUTUBE_GRADE6_10_BATCH1_CANDIDATES:VideoReviewCandidate[]=[
...make("Grade 6","Mathematics",[["BW8exmLChtw","Ordering numbers in descending order"],["Nvub0AjgTvw","KPSEA Mathematics past-paper practice"],["e6UvQvlbZR8","Grade 6 KNEC Mathematics solved questions"],["vi41uTz5aco","Combined operations"],["vqm3hXOTdFc","KPSEA Mathematics revision questions"]]),
...make("Grade 6","English",[["dbCNGrok4XY","Simple present tense and daily activities"],["-EhwpDHgLj4","Adjectives and adverbs"],["VkfHJ2KHj9Q","Troublesome verbs"],["HjienWcuEwU","English questions with explanations"],["RsWw-zAFCNE","Vocabulary revision"]]),
...make("Grade 7","Integrated Science",[["0ZmYoukzXtg","Introduction to Integrated Science and laboratory apparatus"]]),
...make("Grade 7","Mathematics",[["dNU_E9VoD2c","KJSEA pilot Mathematics solved questions"],["ande7sKwrL8","Interpreting line graphs"]]),
...make("Grade 7","English",[["6Ghw2C1h4ao","Grammar and punctuation revision"],["D04TRm1MHwk","Present simple and present progressive"],["n0Rn6aJPzww","Conditional sentences"]]),
...make("Grade 8","Mathematics",[["GtgVXaJ4t8A","Solving equations with fractions"],["GjmV4vkPCAY","Fraction equations practice"],["gDT5xFGBXUw","Linear equations, slopes and unit rates"],["MsU7K7J6obA","Grade 8 Mathematics core skills"],["zk3FhBGuVd8","Factoring polynomials"],["5JcdFG7M2yE","Division of fractions"],["TEWpDZWOG9o","Scientific notation and averages"],["U24HqFjdsKk","Systems of equations challenge"]]),
...make("Grade 8","Science",[["yNfJwoO1Yy0","Forces, energy, waves, heat and electricity overview"],["gv4cshx8Khg","Work and energy"]]),
...make("Grade 8","Geography",[["3RovhJpnGWA","Population change and settlement sustainability"]]),
...make("Grade 9","Integrated Science",[["J-7XlskF7k4","Integrated Science examination review"],["A5TmxVL-glk","Cells, pressure and KJSEA science practice"],["cl6xG2ijoss","Grade 9 Integrated Science KJSEA review"]]),
...make("Grade 9","Mathematics",[["oSukCrTgAog","Geometry word problems with algebra"],["sLt8izdRLUY","Intersecting lines and angle rules"],["bRD9RmYMIRg","Algebra expressions and linear functions"],["5XQEUCv6KIo","Grade 9 Mathematics topic overview"],["XGZMjfaLrjI","Polygons and missing angles"]]),
...make("Grade 9","English",[["1ENFSSrqS2E","Reported speech: questions, commands and requests"],["LGULJOPddS4","Grammar exercises and sentence construction"],["v4ixVqeAXTc","Conditional sentences and wishes"]]),
...make("Grade 10","Mathematics",[["uDIA02X2mBw","Geometry examination review"],["yKGwCMEhJAw","Functions and graph transformations"]]),
...make("Grade 10","Physics",[["nnSLOD7jajg","Waves and electricity revision"],["mCDTLf7c4kU","Waves, sound and light"],["a4aHyWtV2Kw","Electromagnetic radiation introduction"],["7AEK9Y0pwKw","Wave examination questions"],["4vDk3W66s5I","Transverse waves, period and frequency"]]),
...make("Grade 10","Biology",[["N4xviokOhKM","Cell theory and cell structures"],["UY2eMGURINc","Cell theory and levels of organisation"],["whg3-lDz24I","Cellular respiration"]]),
...make("Grade 10","Chemistry",[["Z8B_m3o1g18","Properties of acids and bases"]]),
...make("Grade 10","Business Studies",[["2h5It4YotSU","Business roles, problem solving and social responsibility"]]),
];
if(YOUTUBE_GRADE6_10_BATCH1_CANDIDATES.length!==50) throw new Error(`Expected 50 Batch 1 candidates, found ${YOUTUBE_GRADE6_10_BATCH1_CANDIDATES.length}`);
