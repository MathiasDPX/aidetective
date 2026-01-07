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
    status VARCHAR,
    place VARCHAR,
    description VARCHAR,
    name VARCHAR,
    suspects UUID[]
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
    def __init__(self, timestamp, place, status, name, description):
        self.timestamp = timestamp
        self.place = place
        self.status = status
        self.name = name
        self.description = description

    def register(self):
        conn.execute("INSERT INTO timelines_events (timestamp, place, status, name, description) VALUES (?, ?, ?, ?, ?)", 
                     (self.timestamp, self.place, self.status, self.name, self.description))

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
    def __init__(self, status, place, description, name, suspects):
        self.status = status
        self.place = place
        self.description = description
        self.name = name
        self.suspects = suspects

    def register(self):
        conn.execute("INSERT INTO evidences (status, place, description, name, suspects) VALUES (?, ?, ?, ?, ?)",
                     (self.status, self.place, self.description, self.name, self.suspects))

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
    Party("Kasper", "suspect", "Cook"),
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
    Event(1704067200000, "Dining Hall", "Complete", "New Year's Eve Dinner Begins", "The household gathers for the annual celebration"),
    Event(1704074400000, "Study", "Complete", "Aunt Bethesda Retires", "Aunt Bethesda excuses herself from the party"),
    Event(1704078000000, "Study", "Suspicious", "Unusual Sound", "A dull thud heard from the study"),
    Event(1704081600000, "Study", "Discovered", "Body Found", "Aunt Bethesda found deceased in her study")
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

conn.commit()
print("Database populated successfully with single case: Aunt Bethesda")
conn.close()
