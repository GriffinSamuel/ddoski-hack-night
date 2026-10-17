import type { AvatarId, RoastEmotion } from "@/lib/types";

/** [profane, clean]: the same joke in both modes. Lines are comment-ready (no leading "# "). */
export type RoastPair = readonly [profane: string, clean: string];

export const BANK: Record<AvatarId, Record<RoastEmotion, RoastPair[]>> = {
  labubu: {
    sad: [
      ["Hehehe, this is shit code and you know it.", "Hehehe, this is a total mess and you know it."],
      ["I've seen better loops come out of a dumbass's first tutorial.", "I've seen better loops in a first-day tutorial."],
      ["Damn, did you write this on purpose? Hehe, so brave.", "Wow, did you write this on purpose? Hehe, so brave."],
      ["Even my tiny monster brain spots the bugs. Pathetic skills, bestie.", "Even my tiny monster brain spots the bugs. Rough skills, bestie."],
      ["Cry harder, the interpreter is laughing at your garbage logic.", "Cry harder, the interpreter is laughing at your logic."],
    ],
    happy: [
      ["Hehe, cute. Could be better though. Try a set instead of this crap.", "Hehe, cute. Could be better though. Try a set instead of all this."],
      ["Aww, you think this is done? Name your variables like a grown dev, damn.", "Aww, you think this is done? Name your variables like a grown dev."],
      ["Nested loops again? Sweet summer child, try a dict. Hehe.", "Nested loops again? Sweet summer child, try a dict. Hehe."],
      ["It runs, sure. My collector-box standards are higher than your damn code, though.", "It runs, sure. My collector-box standards are higher than this code, though."],
      ["Could be better, bestie: add a docstring and some tests, dumbass.", "Could be better, bestie: add a docstring and some tests."],
    ],
    "super-happy": [
      ["Hehehe, you smiled, so I deleted it. Fair trade.", "Hehehe, you smiled, so I deleted it. Fair trade."],
      ["Your code was shit anyway. You're welcome, bestie.", "Your code was a mess anyway. You're welcome, bestie."],
      ["Too happy for someone with this skill level. Poof!", "Too happy for someone with this skill level. Poof!"],
      ["Bye bye bugs, bye bye logic, hello nothing. Hehe.", "Bye bye bugs, bye bye logic, hello nothing. Hehe."],
    ],
  },
  "calhacks-bear": {
    sad: [
      ["Bro, this code wouldn't survive demo day. It's shit.", "Bro, this code wouldn't survive demo day. It's a mess."],
      ["Go Bears? More like go back to the tutorial, dumbass.", "Go Bears? More like go back to the tutorial."],
      ["I've reviewed pitch decks with fewer bugs than this damn function.", "I've reviewed pitch decks with fewer bugs than this function."],
      ["No VC funds code like this. Not one. Fix your damn loops.", "No VC funds code like this. Not one. Fix your loops."],
      ["Berkeley admitted you? Prove it, because this is garbage.", "Berkeley admitted you? Prove it, because this is rough."],
    ],
    happy: [
      ["Not bad, bro, but a real hacker would ditch these nested loops. Try a set.", "Not bad, bro, but a real hacker would ditch these nested loops. Try a set."],
      ["Ship it? Hell no. Add type hints first, rookie.", "Ship it? Not yet. Add type hints first, rookie."],
      ["Could be better. Rename that function before the judges see it, damn.", "Could be better. Rename that function before the judges see it."],
      ["Decent for a weekend project. A bear would use a comprehension here.", "Decent for a weekend project. A bear would use a comprehension here."],
      ["Cute code, bro. Now make it actually scale, dumbass.", "Cute code, bro. Now make it actually scale."],
    ],
    "super-happy": [
      ["Too happy, bro. Pivoting your codebase to nothing.", "Too happy, bro. Pivoting your codebase to nothing."],
      ["Series A denied. Your code is gone, damn.", "Series A denied. Your code is gone, sorry."],
      ["Smiling at that code? Bold. Deleted. Go Bears!", "Smiling at that code? Bold. Deleted. Go Bears!"],
      ["Disrupting your repo, one rm at a time. Shit happens.", "Disrupting your repo, one rm at a time. It happens."],
    ],
  },
  "rubber-duck": {
    sad: [
      ["I've listened to your explanation. It was shit. Quack.", "I've listened to your explanation. It was bad. Quack."],
      ["Quack. Even a duck can see that loop is wrong, dumbass.", "Quack. Even a duck can see that loop is wrong."],
      ["I'm a rubber duck and I'm embarrassed for this damn function.", "I'm a rubber duck and I'm embarrassed for this function."],
      ["Quack. Unused variable. Unused skill. Same energy.", "Quack. Unused variable. Unused potential. Same energy."],
      ["Debugging you is harder than debugging this crap. Quack.", "Debugging you is harder than debugging this code. Quack."],
    ],
    happy: [
      ["Quack. It works, technically. A set would be better, you know.", "Quack. It works, technically. A set would be better, you know."],
      ["Smug quack: you forgot a docstring, dumbass.", "Smug quack: you forgot a docstring."],
      ["Could be better. Read the damn style guide, then explain it to me again.", "Could be better. Read the style guide, then explain it to me again."],
      ["I've heard worse explanations. Not many. Quack.", "I've heard worse explanations. Not many. Quack."],
      ["Try early returns and fewer nested hell-loops. Quack.", "Try early returns and fewer nested loops. Quack."],
    ],
    "super-happy": [
      ["Quack quack quack! Your code is gone, dumbass.", "Quack quack quack! Your code is gone, friend."],
      ["I laughed so hard I floated away. Also, deleted.", "I laughed so hard I floated away. Also, deleted."],
      ["You smiled; I pulled the plug. Rubber duck rules.", "You smiled; I pulled the plug. Rubber duck rules."],
      ["Nothing left to debug. Best code you've written, honestly. Damn.", "Nothing left to debug. Best code you've written, honestly."],
    ],
  },
};

/** Shared ASCII art for the super-happy replacement. Each piece is at most 20 lines of at most 60 chars. */
export const ASCII_ART: string[][] = [
  [
    "      _______________",
    "     /               \\",
    "    /   ___     ___   \\",
    "   |   /   \\   /   \\   |",
    "   |   \\___/   \\___/   |",
    "   |        /_\\        |",
    "    \\   |_|_|_|_|_|   /",
    "     \\_______________/",
    "        |_|_|_|_|_|",
  ],
  [
    "         _________",
    "        /         \\",
    "       /  R. I. P. \\",
    "      |             |",
    "      |  YOUR CODE  |",
    "      |             |",
    "      |  1 test run |",
    "      |  0 survived |",
    "   ___|_____________|___",
    "  ^^^^^^^^^^^^^^^^^^^^^^^",
  ],
  [
    "       .-\"\"\"\"\"\"\"\"\"-.",
    "     .'  _       _  '.",
    "    /   (o)     (o)   \\",
    "   |         ^         |",
    "   |   \\___________/   |",
    "    \\     \\_______/   /",
    "     '.   ha ha ha  .'",
    "       '-._______.-'",
  ],
  [
    "     ___________________",
    "    |  _______________  |",
    "    | |               | |",
    "    | |  404           | |",
    "    | |  CODE NOT     | |",
    "    | |  FOUND        | |",
    "    | |_______________| |",
    "    |___________________|",
    "         _|_______|_",
    "        |___________|",
  ],
];
