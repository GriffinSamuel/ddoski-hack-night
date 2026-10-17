import type { FileName } from "@/lib/types";

export const SEED_FILES: Record<FileName, string> = {
  "bad_code.py": `def do_the_thing_with_stuff(data):
    dupes = []
    tmp = 0
    count = len(data)
    for i in range(len(data)):
        # off by one: the last element is never compared
        for j in range(i + 1, len(data) - 1):
            if data[i] == data[j]:
                if data[i] not in dupes:
                    dupes.append(data[i])
    return dupes


numbers = [1, 2, 3, 2, 1, 4, 4]
print(do_the_thing_with_stuff(numbers))
`,
  "good_code.py": `def unique_in_order(items):
    """Return the unique items of \`items\`, keeping first-seen order."""
    seen = set()
    unique = []
    for item in items:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


if __name__ == "__main__":
    print(unique_in_order([3, 1, 3, 2, 1]))
`,
};

export const FILE_NAMES: FileName[] = ["bad_code.py", "good_code.py"];
