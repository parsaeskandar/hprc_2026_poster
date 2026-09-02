# HPRC 2026 talk: design, script, and delivery notes

**Slot:** 15 minutes (plan for 13:30 of talking, leave 90 s of slack for the room).
**Deck:** `HPRC2026_talk.pptx` (16 main slides + 3 backup). Speaker notes are embedded in every slide; this file is the long form.

---

## 1. The one sentence

> HPRC release 2 gave us 466 genomes and no way to move knowledge between them. We indexed the graph so every base knows every haplotype, and the UCSC Genome Browser can now search, translate, and lift annotations across all of them, live.

Everything in the talk serves that sentence. If a slide doesn't, cut it.

## 2. The arc (and why this order)

| # | Beat | Job of the beat | Time |
|---|------|-----------------|------|
| 1 | Title | Set the tone: confident, visual | 0:20 |
| 2 | **Hook**: every fact has an address; +466 | Make the room feel the problem in one breath | 1:00 |
| 3 | The two old tools break at 466 | Name the challenge concretely (alignment, lift-over, 56 chains) | 1:15 |
| 4 | Three questions a user asks | Turn the problem into a promise the talk will keep | 0:45 |
| 5 | What we built, in one picture | Orient; then get out of the way | 0:50 |
| 6 | Foundation: tag arrays | The one idea that makes everything possible | 1:15 |
| 7 | Translation is a walk, not a lookup | The algorithm, in four steps on one figure | 1:30 |
| 8 | Demo: search | Question 1 answered | 1:00 |
| 9 | Demo: the hit as a track | ... and it is a first-class browser object | 0:30 |
| 10 | Demo: convert | Question 2 answered | 0:45 |
| 11 | **Demo: arrive with annotations** | Question 3 answered. This is the payoff slide | 1:30 |
| 12 | No new habits: hgConvert | Adoption is free | 0:30 |
| 13 | Fast enough | Credibility: numbers, briefly | 0:50 |
| 14 | Not done yet, and the plan | Honesty + the path to public release | 1:30 |
| 15 | Vision: yes / yes / yes | Close the loop on slide 4 | 0:40 |
| 16 | Thanks | | 0:15 |

Total: about 14:15. Backup slides B1 to B3 are for questions only.

**Structural choices worth knowing about:**

- The hook is *not* "the HPRC graph is great". The room already believes that. The hook is the cost of having 466 coordinate systems. It makes the audience want the solution before they see it.
- Slide 4 plants three questions; slide 15 answers them. The audience gets closure, and you get a natural ending line.
- Method (6, 7) comes *before* the demos. People trust a demo more once they know why it works, and the demos then read as consequences rather than magic.
- Slide 11 is the thesis Benedict asked for: "how alignment and rapid lift-over make HPRC2 useful in the browser." Give it the most time of any demo slide. Slow down there.
- Slide 14 says plainly what is not finished. Saying it yourself, with a plan attached, is stronger than being asked about it.

## 3. Script

Timings are cumulative targets. Lines in *italics* are stage directions.

### Slide 1: Title (0:00 to 0:20)

"Thanks. I'm Parsa Eskandar from Benedict Paten's lab at UC Santa Cruz, and I want to show you something we've built with the UCSC Genome Browser team: the browser can now speak pangenome."

*Advance on "speak pangenome".*

### Slide 2: Hook (0:20 to 1:20)

"Every fact we know about the human genome has an address: a chromosome and a position. And almost every one of those addresses is written in one of two coordinate systems: hg38 or CHM13.

HPRC release 2 just handed us 466 more genomes. Which means 466 more coordinate systems.

That is a gift and a problem. The gift is obvious. The problem is this talk: how do we make everything we already know, findable in every one of them?"

### Slide 3: Two tools, both break (1:20 to 2:35)

"For thirty years, two tools have moved knowledge between genomes.

*Point left.* Alignment. You have a sequence, you BLAT it. But BLAT runs against one assembly at a time. There are 466 now, and nothing lets you ask the graph itself: who carries this?

*Point right.* Lift-over. A chain file between two assemblies, and QuickLift can draw one assembly's tracks on top of another. But a chain is a pairwise object. With 466 assemblies that's about 213,000 pairs. We counted what actually exists in the browser database: 56.

The pangenome graph is, in principle, the alignment of all of them at once. But inside the browser, it has been a file, not a tool."

### Slide 4: Three questions (2:35 to 3:20)

"Strip this down to what a browser user actually types.

One: I have a sequence. Which haplotypes carry it, and where?
Two: I have a region on CHM13. Where is it on HG02015?
Three: when I get there, can I see the genes?

Today the honest answer to all three is no. By the end of this talk I want to have answered all three: live, inside the browser you already use."

### Slide 5: What we built (3:20 to 4:10)

"Here's the whole system in one breath. The browser talks to a service. The service holds two engines over the HPRC v2 graph: vg giraffe, for mapping sequences, and our coordinate-translation index. Everything else is presentation: three pages in the browser, and three things they do. Search. Translate. Lift annotations.

Let me start with the one idea that makes translation possible at all."

### Slide 6: Tag arrays (4:10 to 5:25)

"The foundation is the tag-array index, from our lossless pangenome indexing work.

A standard FM-index or r-index over all 464 haplotype sequences will find where a string occurs. But it only gives you positions in a text. Tag arrays annotate every position of the BWT with its graph position, the node it belongs to.

And once you're standing on a node, the GBWT tells you every haplotype that passes through it, and where. All 464, in a single lookup.

Notice what's missing: there is no per-pair index anywhere. Nothing that says CHM13-to-HG02015. That one property is what makes any-to-any translation possible."

### Slide 7: Translation is a walk (5:25 to 6:55)

"So here's how a region moves.

*Badge 1.* Locate the query interval's nodes on the source haplotype's path.
*Badge 2.* At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once.
*Badge 3.* Nodes that source and target each visit exactly once are unambiguous anchors: guaranteed orthologous. A colinearity check drops the few pairs that don't make sense.
*Badge 4.* Walk the graph between anchors and emit an offset for every base. Then fold that into blocks: a block breaks on an indel or an inversion, never on a SNP.

That last part matters. That is exactly what a chain file means. So the output of translation isn't just a coordinate. It is a chain, and the browser already knows what to do with a chain."

### Slide 8: Search (6:55 to 7:55)

"Question one. This is the Pangenome Mapping page: BLAT, but for the pangenome.

You paste a sequence. It is mapped once, to the whole graph, with vg giraffe. You get back every assembly consistent with it, ranked by identity, and a position on whichever haplotype you pick. Picking a different haplotype re-surjects the same alignment; nothing is remapped."

### Slide 9: The hit as a track (7:55 to 8:25)

"And when you click through, the hit lands in the browser as a native track, with base-level differences colored the way BLAT users already know. Nothing here is a special case; it is just another track on another assembly."

### Slide 10: Convert (8:25 to 9:10)

"Question two. Convert Coordinates Between Assemblies. Source CHM13, a ten-kilobase region on chromosome 6. Target: any of the other 463 haplotypes, and the picker can show only the ones that actually contain the region.

Result: HG02015 paternal, contig CM085893, a hundred percent of bases, a hundred percent of span. About twenty milliseconds."

### Slide 11: Arrive with annotations (9:10 to 10:40)

*Slow down. This is the slide Benedict asked for.*

"Question three, and this is the one I care about most.

This is HG02015 paternal, a sample assembly with almost no annotation of its own. And you're looking at CHM13's CAT and Liftoff genes, the HLA-DMA cluster, RefSeq, CenSat, drawn at their translated positions. Above them, an Alignment Differences track marks every insertion, deletion and mismatch between the two assemblies.

The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain, the browser's own QuickLift drew the tracks, and the chain will be reused for every pan.

This is what I mean by making release 2 useful in the browser: every assembly can borrow the annotation of a well-annotated reference, on demand. No precomputation, no chain library, no waiting for someone to annotate 466 genomes."

### Slide 12: hgConvert (10:40 to 11:10)

"And it asks nothing new of users. Open the ordinary hgConvert page and the pangenome assemblies are simply in the menu. Pick one, and the conversion goes through the graph instead of a chain file. Same button, new capability."

### Slide 13: Fast enough (11:10 to 12:00)

"Is it fast enough to sit behind a web page? Gene-scale regions translate in about twenty milliseconds. A hundred kilobases in under a second. A megabase in about four.

And it scales: the index is read-only and thread-safe, so eight concurrent users get nearly ten times the throughput of one. That is why this can be a service rather than a batch job."

### Slide 14: Not done, and the plan (12:00 to 13:30)

"Now, honestly, what's not finished, and what's planned.

Today, chains are built per view. Pan far enough and we build another one. Wide, segmental-duplication-heavy regions lose positions; on the 1q21.1 region we recover about half.

The plan. First and foremost: this is on the development browser today; the goal is the public UCSC Genome Browser.

Second, chains that cover more and persist: today a widened chain dies with the session; sharing it across users makes popular regions free after the first visit.

Third, better recovery in wide, segdup-dense regions. And more graphs: nothing here is specific to release 2. New HPRC releases plug in by building one index."

### Slide 15: Vision (13:30 to 14:10)

"So, back to the three questions.

Which haplotypes carry my sequence? Yes. Where is my region on HG02015? Yes. Can I see the genes when I get there? Yes.

466 genomes, one browser, and knowledge that moves between them."

### Slide 16: Thanks (14:10 to 14:25)

"This is work with Jouni Sirén and Benedict Paten, with a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you, and I'm happy to take questions."

## 4. Delivery notes

- **Open without a warm-up.** No "today I'll talk about". The first content sentence is "Every fact we know about the human genome has an address."
- **One pause per slide**, after the sentence that carries the slide. On slide 2 it is "466 more coordinate systems." On slide 11 it is "did not exist a second before the page loaded."
- **Point at the screenshots.** They are real. Say "this is the dev browser, this morning" if it is true; realness is the whole point of showing screenshots instead of diagrams.
- **Don't read the four steps** on slide 7; narrate them while touching each badge.
- **Numbers to know cold:** 233 samples, 464 haplotypes, 466 assemblies (with CHM13 and GRCh38), 56 chains of ~213,000 pairs, ~20 ms gene-scale, 0.6 s at 100 kb, 4.3 s at 1 Mb, 9.6x at 8 threads, 15 lines changed in kent core.
- If you are running long at slide 12, skip it (it is 30 s and the point is made by slide 11).

## 5. Questions to expect

**"Why not just precompute all the chains offline?"**
466 × 466 pairs is about 213,000 chains; computing and hosting all of them is a large standing cost for pairs almost nobody asks for. On-demand generation makes arbitrary regions and arbitrary pairs possible today, and caching widened chains across users (slide 14) gets popular regions most of the benefit of precomputation without the cost.

**"How does this differ from vg surject or minigraph-cactus liftover tools?"**
Same graph, different access pattern. Surjection needs an alignment; we translate coordinates without one, through anchors that both haplotypes visit exactly once, so it works for any interval and returns chain-semantics blocks the browser can draw directly. And it runs in tens of milliseconds behind a web request.

**"What about accuracy in repeats / segmental duplications?"**
Anchors are nodes visited exactly once by both haplotypes, so repeats never produce false anchors; the failure mode is missing positions, not wrong ones. Wide segdup-dense intervals currently lose positions (about 46% recovered on 1q21.1); improving recovery there is on the list.

**"Which graph, and can it use others?"**
HPRC v2.0 Minigraph-Cactus, CHM13-based, 148M nodes. Nothing is release-specific; the index is rebuilt per graph.

**"What does it cost to run?"**
One service with the graph, r-index, tag arrays and GBWT loaded (the FastLocate structure alone is about 11 GB); on the order of a few hundred GB of RAM. It serves all users; the browser CGI is stateless.

**"Is identity the same as BLAT identity?"**
No. It is per-haplotype: of the read bases aligned to the graph, the fraction lying on nodes that haplotype visits and matching there. Soft-clipped ends are excluded, so a partial hit can look better than it is; we show coverage alongside identity for that reason.

**"When can I use it?"**
It runs on the development browser now. Public release is the next milestone (slide 14).

**"How much of the browser did you have to change?"**
Three files, fifteen lines in kent core. Everything else is a new, self-contained CGI, dark unless configured.
