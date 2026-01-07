"""
Populate the database with the single case
"""

import duckdb
import os

conn = duckdb.connect("database.db")

conn.sql("""CREATE TABLE IF NOT EXISTS cases (
    name VARCHAR PRIMARY KEY,
    detective VARCHAR,
    short_description VARCHAR DEFAULT NULL
)""")
conn.sql("""CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR,
    role VARCHAR,
    description VARCHAR DEFAULT NULL,
    alibi VARCHAR DEFAULT NULL,
    image BLOB DEFAULT NULL
)""")
conn.sql("""CREATE TABLE IF NOT EXISTS evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place VARCHAR,
    description VARCHAR,
    name VARCHAR,
    suspects UUID[],
    image BLOB DEFAULT NULL
)""")
conn.sql("""CREATE TABLE IF NOT EXISTS theories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR,
    content VARCHAR
)""")
conn.sql("""CREATE TABLE IF NOT EXISTS timelines_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp BIGINT,
    place VARCHAR,
    status VARCHAR,
    name VARCHAR,
    description VARCHAR
)""")

# Clear existing data
conn.execute("DELETE FROM timelines_events")
conn.execute("DELETE FROM theories")
conn.execute("DELETE FROM evidences")
conn.execute("DELETE FROM parties")
conn.execute("DELETE FROM cases")

# Insert the single case
case_name = "Aunt Bethesda"
conn.execute("INSERT INTO cases (name, short_description) VALUES (?, ?)",
             (case_name, "Aunt Bethesda was killed on the 31st of December 2025 by one of her closest assistant"))

class Event:
    def __init__(self, timestamp, place, name, description):
        self.timestamp = timestamp
        self.place = place
        self.name = name
        self.description = description

    def register(self):
        conn.execute("INSERT INTO timelines_events (timestamp, place, name, description) VALUES (?, ?, ?, ?)", 
                     (self.timestamp, self.place, self.name, self.description))

class Theory:
    def __init__(self, name, content):
        self.name = name
        self.content = content

    def register(self):
        conn.execute("INSERT INTO theories (name, content) VALUES (?, ?)",
                     (self.name, self.content))

class Party:
    def __init__(self, name, role, description="", alibi="", image=None):
        self.name = name
        self.role = role
        self.description = description
        self.alibi = alibi
        self.image = image

    def register(self):
        conn.execute("INSERT INTO parties (name, role, description, alibi, image) VALUES (?, ?, ?, ?, ?)",
                     (self.name, self.role, self.description, self.alibi, self.image))

class Evidence:
    def __init__(self, place, description, name, suspects, image):
        self.place = place
        self.description = description
        self.name = name
        self.suspects = suspects
        

    def register(self):
        conn.execute("INSERT INTO evidences (place, description, name, suspects) VALUES (?, ?, ?, ?)",
                    (self.place, self.description, self.name, self.suspects))

# Parties
parties = [
    Party("Renran", "detective"),
    Party("Clay", "detective"),
    Party("Reem", "detective"),
    Party("Alex", "detective"),
    Party("Annabel", "detective"),

    Party("Euan", "suspect", "Estate Manager"),
    Party("Tongyu", "suspect", "Gardener"),
    Party("Herby", "suspect", "Healer"),
    Party("Kacper", "suspect", "Cook"),
    Party("Jane", "suspect", "Social Elite"),

    Party("Aunt Bethesda", "victim", "Our beloved aunt")
]

for party in parties:
    image_path = os.path.join("images", party.name.lower() + ".jpg")
    if os.path.isfile(image_path):
        party.image = open(image_path, "rb").read()
    party.register()

# Timeline events
events = [
    Event(1767221999000, "Aunt's bedroom", "Aunt found dead", "The Aunt Bethesda is found dead in her house"),
    Event(1767124859000, "Living room", "Argument with Tongyu", "The nights before the murder, Tongyu and the aunt had a big argument"),
    Event(1767214800000, "Kitchen", "Tea with Herby", "The night of the murder, Herby and the aunt shared a cup of tea"),
    Event(1767679200000, "Aunt's office", "Kacper's letter", "A couple days after the event, Jane found a letter from Kacper in Aunt's office. He was begging her to give him a job as a cook, regardless of the wages and hours she requires as he heard she was a woman who values second chances.")
]

for event in events:
    event.register()

# Theories
theories = [
    Theory("The Trusted Servant Theory", "One of the household staff with access to the study poisoned Aunt Bethesda's drink before she retired."),
    Theory("The Inheritance Motive Theory", "A family member desperate for their inheritance committed the crime."),
    Theory("The Business Rival Theory", "An external party gained access to the estate and eliminated Aunt Bethesda to prevent a business deal.")
]

for theory in theories:
    theory.register()

# Evidences
# Get suspect IDs
suspect_rows = conn.execute("SELECT id, name FROM parties WHERE role = 'suspect'").fetchall()
suspects_by_name = {row[1]: row[0] for row in suspect_rows}

evidences = [
    Evidence("Aunt's office", "The letter sent by Kacper to Aunt Bethesda asking for a j*b", "Kacper's employment letter", [suspects_by_name.get("Kacper")]),
    Evidence("Police station", "", "Kacper's criminal record", [suspects_by_name.get("Kacper"), suspects_by_name.get("Euan")]),
    Evidence("Midnight & Hawthorn", "Financial record of Jane's debt to her aunt Augusta. She's in 6.7M€ in debt", "Jane's Financial Record", [suspects_by_name.get("Jane")])
]

for evidence in evidences:
    evidence.register()

conn.commit()
print("Database populated successfully with single case: Aunt Bethesda")
conn.close()
