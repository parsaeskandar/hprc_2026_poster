# HPRC 2026 talk: design, script, and delivery notes (v2)

**Slot:** 15 minutes. The script below runs about 14:00 with pauses; if the slot is 12 + 3 for questions, use the cut order in section 4 to land at 11:30.
**Deck:** `HPRC2026_talk.pptx`, 17 main slides + 4 backup. Speaker notes are embedded in every slide; this file is the long form.
**Audience:** the HPRC meeting. Everyone builds or uses pangenome graphs. Do not explain what a pangenome is. Do explain what is new: web latency, any pair, no alignment step, inside the browser everyone uses.

---

## 1. The one sentence

> The HPRC release 2 graph holds 464 haplotypes and the browser has no way to move knowledge between them. We indexed the graph so every base knows every haplotype, and the UCSC Genome Browser can now search, translate, and lift annotations across all of them, live.

## 2. The arc

| # | Slide | Job | Budget | Elapsed |
|---|---|---|---|---|
| 1 | Title | Land the name, don't linger | 0:15 | 0:15 |
| 2 | 464 assemblies. 56 chain files. | Cold open: name the gap in a system they use | 0:45 | 1:00 |
| 3 | Two old tools. Both are single-pair. | Name what exists (honestly) and what doesn't | 0:50 | 1:50 |
| 4 | Two users the browser can't serve today | The promise: two stories | 0:40 | 2:30 |
| 5 | One service, two engines, three pages | Orient, then get out of the way | 0:45 | 3:15 |
| 6 | Every base knows every haplotype that carries it | The one idea (tag arrays) | 1:10 | 4:25 |
| 7 | Translating a region is a walk, not a lookup | The method, on one figure | 1:30 | 5:55 |
| 8 | Story 1: paste a sequence, see every haplotype that carries it | Story 1, part 1 | 1:00 | 6:55 |
| 9 | ...and map it onto the haplotype you choose | Story 1, part 2 | 0:30 | 7:25 |
| 10 | Story 2: a reference gene, found on any haplotype in ~100 ms | Story 2, part 1 | 0:50 | 8:15 |
| 11 | ...or from the hgConvert page he already uses | Story 2, aside (first to cut) | 0:25 | 8:40 |
| 12 | ...and arrive with the reference's annotations | Story 2, payoff. Slow down. | 1:40 | 10:20 |
| 13 | What we have checked, and what we haven't | Trust before speed | 0:50 | 11:10 |
| 14 | Fast enough to sit behind a web page | Credibility, brisk | 0:50 | 12:00 |
| 15 | Real limits, and what's next | Honesty and the path to public release | 1:05 | 13:05 |
| 16 | Both users, served | Close both stories, then the ask | 0:40 | 13:45 |
| 17 | Thank you | | 0:15 | 14:00 |

Why this order: the open names a broken thing inside a tool the room uses, instead of telling them release 2 is big. Slide 4 introduces two users (one with a sequence, one with a gene on a reference) and slide 16 shows both served; slides 8-9 are Story 1, slides 10-12 are Story 2. Method (6, 7) comes before the demos so the demos read as consequences. Slide 12 is the thesis: how alignment and rapid lift-over make release 2 useful in the browser. Slide 13 says what is and isn't validated before anyone asks.

## 3. Script

Timings are cumulative. Stage directions in *italics*.

### 1. Title (0:00 to 0:15)
"Thanks. I'm Parsa Eskandar, from Benedict Paten's lab at UC Santa Cruz, and this is joint work with Jouni Sirén and the UCSC Genome Browser team."

### 2. Cold open (0:15 to 1:00)
"The UCSC Genome Browser can open 464 HPRC haplotype assemblies. The same database has 56 chain files.

*Two full beats. Let them do the arithmetic.*

Which means almost everything we know about the human genome is written in hg38 or CHM13, and for the other 462 there is no way to move any of it across. You can look at them. You can't ask them anything. That's this talk."

### 3. Two old tools (1:00 to 1:50)
"For thirty years two tools have moved knowledge between genomes: alignment and lift-over. Neither is broken. Both are single-pair.

*Point left.* BLAT runs against one assembly. There are 464 now.
*Point right.* A chain covers one ordered pair. Two hundred thousand possible pairs; the browser has fifty-six.

And yes, this room can already query the graph: giraffe, the r-index, odgi, halLiftover on the Cactus alignment. From a shell, in seconds to minutes, by people who write shell.

What has not existed is that capability at web latency, for any pair, inside the tool everyone else uses. In the browser, the graph has been a file, not a tool."

### 4. Two users (1:50 to 2:30)
"So let me follow two users through the browser.

The first has a sequence in hand: a probe, a contig, a variant's flanks. Which haplotypes in the graph carry it, and where on each? And then: map it, and look at it.

The second has a gene, and knows it on a reference: GRCh38, or CHM13. Where is that gene on HG02015? And when they get there, can they see its annotation?

Everyone in this room can serve both users with enough shell. Nobody can do it from the browser, in seconds, for an arbitrary haplotype. By the end of this talk: both, live."

### 5. Architecture (2:30 to 3:15)
"Here's what we built to answer all three, and it fits on one slide. The browser talks to a service. The service holds two engines over the HPRC v2 graph: vg giraffe for mapping sequences, and our coordinate-translation index. Three pages in the browser, three things they do: search, translate, lift annotations.

Fifteen lines changed in the browser's core; everything else is a new page. Let me start with the one idea that makes translation possible at all."

### 6. Tag arrays (3:15 to 4:25)
"The foundation is our tag-array index, from the lossless pangenome indexing work.

An r-index over all 464 haplotypes tells you where a string occurs, but only as a position in a text. Tag arrays add one thing: every position in the BWT also carries its node in the graph. So a string match doesn't give you an offset. It gives you a place in the graph. One tag per BWT run, not per position, which is why this fits in memory.

And once you're standing on a node, the GBWT tells you every haplotype that passes through it, and where. All 464, in a single lookup.

Notice what's missing: nothing anywhere says CHM13-to-HG02015. That is the property that makes any-to-any translation possible."

### 7. Translation (4:25 to 5:55)
"With that one property in hand, translating a region stops being a lookup and becomes a walk.

*Badge 1.* Find the query interval's nodes on the source haplotype's path.
*Badge 2.* At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once.
*Badge 3.* Nodes that source and target each visit exactly once are unambiguous anchors. Orthology is inherited from the graph's alignment. What we guarantee is that a repeat can't manufacture a false anchor, and a colinearity check drops pairs whose spans disagree.
*Badge 4.* Walk the graph between anchors, one base at a time, and group the bases that share an offset into blocks. A block breaks on an indel, never on a SNP; an inversion starts a new chain. That is exactly what a chain file means.

So the output isn't a coordinate. It is a chain, and the browser already knows what to do with a chain. And if the target simply doesn't contain the interval, you get fewer positions, never invented ones."

### 8. Story 1: search (5:55 to 6:55)
"That's the whole method. Now the two users, starting with the one holding a sequence.

This is the Pangenome Mapping page: BLAT, but for the pangenome. She pastes her sequence, a kilobase here. It is mapped once, to the whole graph, with vg giraffe. She gets back every haplotype that carries it, ranked by identity: here two, HG01167 hap1 and HG04157 paternal. And a position on whichever one she picks. Picking a different haplotype re-surjects the same alignment; nothing is remapped.

You'll notice MAPQ zero. That's not a bad alignment; that's what MAPQ means in a graph where every locus exists hundreds of times. We report identity and coverage per haplotype instead."

### 9. Story 1: mapped as a track (6:55 to 7:25)
"She clicks through to a haplotype, here HG01167 hap1, and doesn't land on a special page. She lands in the browser, on that haplotype, with her sequence as a native track and base-level differences colored the way BLAT users already know. That's the first user done: which haplotypes, where, and mapped."

### 10. Story 2: convert (7:25 to 8:15)
"The second user starts from coordinates, not a sequence. He knows his gene on a reference. Here the source is CHM13 and the gene is HLA-DMA, a ten-kilobase region on chromosome 6; GRCh38 is a path in this graph too, so hg38 works exactly the same way. Target: any of the other 463 haplotypes, and the picker can show only the ones that actually contain the region.

He picks HG02015 paternal, a haplotype he has never looked at. Result: contig CM085893, a hundred percent of bases, a hundred percent of span, in about a hundred milliseconds."

### 11. Story 2: hgConvert (8:15 to 8:40)
"And it asks nothing new of him. Open the ordinary hgConvert page and the pangenome assemblies are simply in the menu. Pick one, and the conversion goes through the graph instead of a chain file. Same button, new capability."

### 12. Story 2: arrive with annotations (8:40 to 10:20)
*Slow down. This is the slide the talk exists for.*

"But a coordinate on its own is a lonely thing. He clicks the result, and this is the part I care about most.

This is HG02015 paternal, at his gene. Release 2 gave it CAT and Liftoff genes, and per-assembly annotation is the right answer where it exists. What HG02015 does not have, and never will, is everything else: ClinVar, the GWAS catalog, ENCODE, your lab's BED file. Those live once, on one reference.

And here they are: CHM13's tracks, drawn at their translated positions, under an Alignment Differences track marking every insertion, deletion and mismatch between the two assemblies.

*Pause.* The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain, the browser's own QuickLift drew the tracks, and the chain is reused for every pan.

That's the second user done: a gene he knew on a reference, on a haplotype nobody annotated for him, with the reference's annotation around it. And that's what I mean by making release 2 useful. The thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. Any haplotype can borrow them, on demand, for the region you're actually looking at."

### 13. Checked and not yet (10:20 to 11:10)
"Before the numbers on speed, the numbers on trust, and which ones I actually have.

Checked: the Alignment Differences track, base by base, across 22 kb of ABO: exactly the two real mismatches, nothing invented. A correctness check, not a divergence estimate. Completeness by span: 99% at gene scale, 93% at a megabase. And one hard case: a segdup-dense span on 1q21.1 recovers about half its bases. Missing positions, not wrong ones: a repeat cannot manufacture an anchor.

Not yet: halLiftover on the same Cactus alignment, agreement with the 56 existing chains, and the one I care about most, CHM13's CAT transcripts onto a haplotype that has its own CAT annotation, exon boundary by exon boundary. Those three come before public release."

### 14. Fast enough (11:10 to 12:00)
"None of this matters if it takes a minute. So: is it fast enough to sit behind a web page?

Exon-scale intervals translate in about twenty milliseconds, a ten-kilobase gene in about a tenth of a second, a hundred kilobases in under a second, a megabase in about four.

And it serves many people at once: throughput goes from six to sixty queries a second and saturates around eight cores. Read that as 'one box serves about sixty queries a second', not as perfect scaling; the single-thread number was warm-up-limited."

### 15. Limits and next (12:00 to 13:05)
"Two things I want to be honest about before I stop.

Chains are built per view, so if you pan far enough we build another one. And wide, segdup-dense spans lose positions: on 1q21.1 we recover about half. Missing, not wrong. This runs on the development browser, as one service with about 250 gigabytes of RAM, and there is no public API yet.

What's next. Chains that persist: right now a widened chain dies with your session; share it across users and popular regions are free after the first visit. Better recovery in segdups. A documented JSON API, because half of you will want this from a pipeline, not a browser. And more graphs: nothing here is specific to release 2; a new release plugs in by building one index.

And the milestone all of that serves: the public UCSC Genome Browser."

### 16. Both users, served (13:05 to 13:45)
"So, back to the two users I promised.

The one with a sequence: every haplotype that carries it, ranked, and mapped as a track on the one she chose. The one with a gene on a reference: the same gene on HG02015 in a tenth of a second, with the reference's annotation drawn around it, over a chain built on the spot.

It's live on the development browser today. So bring me your hardest region, and tell me where it breaks."

*Advance to the thanks slide. Let it breathe. Then take questions.*

### 17. Thanks (13:45 to 14:00)
"None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you."

## 4. Delivery notes

- **Open cold.** No "today I'll talk about". First sentence: "The UCSC Genome Browser can open 464 HPRC haplotype assemblies."
- **One pause per slide**, after the sentence that carries it. Slide 2: after "56 chain files." Slide 12: after "did not exist a second before the page loaded."
- **Point at the screenshots.** They are real. Say so.
- **Don't read the four steps** on slide 7; narrate while touching each badge. Hard caps: slide 7 at 1:35, slide 12 at 1:45, slide 6 at 1:10. These are where you will run long.
- **The two stories, in one breath each:** Story 1 (slides 8-9): a sequence in, every carrying haplotype out, mapped as a track on the one she picks. Story 2 (slides 10-12): a gene known on GRCh38 or CHM13, found on HG02015 in ~100 ms, with the reference's annotation drawn around it. If you want Story 2 to literally start from GRCh38, re-take `crop_convert.png` and `crop_lifted.png` with hg38 as the source; nothing else changes.
- **Numbers to know cold:** 464 haplotypes (CHM13 and GRCh38 included), 56 chains of 200,000+ pairs, 148M nodes, ~20 ms for ≤1 kb, 115 ms at 10 kb, 0.6 s at 100 kb, 4.3 s at 1 Mb, ~60 queries/s per server, 46% recovered on 1q21.1, 15 lines in kent core, ~250 GB RAM.
- **Vocabulary, and never deviate:** "haplotype assembly" or "haplotype" for the 464. Don't say 466. Don't say "genome" for 464.
- **Emergency cut order:** (1) slide 11 hgConvert, 25 s; (2) slide 9 native track, 30 s; (3) the throughput chart on slide 14, speak one sentence instead, 25 s; (4) the fourth "Next" bullet on slide 15, 10 s. Never cut slides 7, 12, or 13.

## 5. Questions to expect

**"halLiftover already does any-to-any on the same Cactus alignment, and impg projects ranges in milliseconds. What's new?"**
Nothing about the alignment: it is Cactus's, and where halLiftover and we disagree one of us has a bug, which is a comparison I am running, not a claim I am making. Three things differ. Access pattern: halLiftover wants the HAL, a large file and a batch tool; we answer from a resident index in about a tenth of a second for a gene, behind a web request. No alignment of the query: an interval goes in and blocks come out, through anchors both haplotypes visit exactly once. Output: chain-semantics blocks, so the browser's own QuickLift draws them with no new machinery, which is why the core change is fifteen lines. impg is the closest in spirit; it works from alignment records, we work from the graph index, which is what gives all 464 haplotypes from one query.

**"What is your accuracy, and what happens in segdups and centromeres?"**
Structurally: an anchor is a node visited exactly once by both paths, so a repeat can't create a false anchor; a colinearity gate drops pairs whose spans disagree; the failure mode is a missing position, not a wrong one. Orthology itself is the graph's: a paralogy collapsed by Minigraph-Cactus is inherited. Measured: the Alignment Differences track is exact at base level where we checked; completeness is 99% at gene scale and 93% at 1 Mb; a segdup-dense span on 1q21.1 recovers 46%. Not yet measured at scale against an independent source, and the three comparisons on slide 13 come before public release. Orthology itself is inherited from the graph; where Minigraph-Cactus collapsed paralogs or left regions unaligned, we inherit that too.

**"Can I call this from my pipeline? Can I use my own graph or assemblies?"**
Pipeline: not yet, honestly. It is JSON over HTTP and the browser is just a client, but there is no documented or stable endpoint. A public API is on the plan; tell me what shape you want. Own graph: yes, nothing is release-specific; one index build per GBZ. GRCh38 is already a path in this graph, so hg38 as a source works now. Own assemblies: to be a target, an assembly has to be in the graph; there is no per-user assembly injection. Own annotations: anything QuickLift can draw travels over the chain, so custom tracks should ride along; I want to verify that for track hubs before promising it.

**"Why not just precompute all the chains?"**
464 × 463 is more than 200,000 chains, a large standing cost for pairs almost nobody asks for. On-demand generation makes arbitrary regions and arbitrary pairs possible today, and caching widened chains across users (slide 15) gets popular regions most of the benefit without the cost.

**"Is identity the same as BLAT identity?"**
No. It is per haplotype: of the read bases aligned to the graph, the fraction lying on nodes that haplotype visits and matching there. Soft-clipped ends are excluded, so a partial hit can look better than it is; we show coverage alongside identity for that reason. MAPQ is 0 by design in a graph where every locus exists hundreds of times.

**"What does it cost to run?"**
One service with the graph, r-index, tag arrays and GBWT loaded (FastLocate alone is about 11 GB), on the order of 250 GB of RAM. It serves all users; the browser CGI is stateless.

**"When can I use it?"**
It runs on the development browser now. Public release is the next milestone, after the three validation numbers on slide 13.
