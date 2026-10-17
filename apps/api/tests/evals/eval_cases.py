"""Eval cases for the roast prompt: the demo-script inputs first. Not collected by pytest (no test_ prefix)."""

BAD_CODE = '''def do_the_thing_with_stuff(data):
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
'''

GOOD_CODE = '''def unique_in_order(items):
    """Return the unique items of `items`, keeping first-seen order."""
    seen = set()
    unique = []
    for item in items:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


if __name__ == "__main__":
    print(unique_in_order([3, 1, 3, 2, 1]))
'''

# (file_name, code, emotion, avatar, mode)
CASES = [
    ("bad_code.py", BAD_CODE, "sad", "labubu", "profane"),          # demo step 5
    ("bad_code.py", BAD_CODE, "sad", "calhacks-bear", "profane"),   # demo step 12
    ("bad_code.py", BAD_CODE, "sad", "calhacks-bear", "clean"),     # demo step 13
    ("good_code.py", GOOD_CODE, "happy", "labubu", "profane"),      # demo step 7
    ("good_code.py", GOOD_CODE, "super-happy", "labubu", "profane"),  # demo step 9
    ("good_code.py", GOOD_CODE, "happy", "rubber-duck", "clean"),
    ("good_code.py", GOOD_CODE, "super-happy", "rubber-duck", "clean"),
    ("bad_code.py", BAD_CODE, "sad", "rubber-duck", "clean"),
]
