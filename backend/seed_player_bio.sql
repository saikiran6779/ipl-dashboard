-- ── IPL 2025 Player Bio Seed ──────────────────────────────────────────────────
-- Run AFTER the app has started at least once (so Hibernate adds the new columns).
-- Hibernate naming: dateOfBirth → date_of_birth, battingStyle → batting_style, etc.
-- Columns are nullable; players whose data is uncertain are left with partial NULLs.

-- ── RCB ────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1988-11-05', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=2;  -- Virat Kohli
UPDATE players SET date_of_birth='2000-06-10', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=3;  -- Rajat Patidar
UPDATE players SET date_of_birth='2000-07-07', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm medium'       WHERE id=4;  -- Devdutt Padikkal
UPDATE players SET date_of_birth='1991-02-16', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=5;  -- Mayank Agarwal
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=6;  -- Swastik Chhikara
UPDATE players SET date_of_birth='1996-08-28', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=7;  -- Phil Salt
UPDATE players SET date_of_birth='1993-10-14', nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=8;  -- Jitesh Sharma
UPDATE players SET date_of_birth='1991-03-24', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=9;  -- Krunal Pandya
UPDATE players SET date_of_birth='1993-08-04', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=10; -- Liam Livingstone
UPDATE players SET date_of_birth='1996-03-16', nationality='Singaporean',  batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=11; -- Tim David
UPDATE players SET date_of_birth='2003-11-12', nationality='English',      batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=12; -- Jacob Bethell
UPDATE players SET date_of_birth='1996-08-05', nationality='West Indian',  batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=13; -- Romario Shepherd
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm orthodox'      WHERE id=14; -- Swapnil Singh
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=15; -- Manoj Bhandage
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=16; -- Abhinandan Singh
UPDATE players SET date_of_birth='1990-01-08', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=17; -- Josh Hazlewood
UPDATE players SET date_of_birth='1990-02-05', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=18; -- Bhuvneshwar Kumar
UPDATE players SET date_of_birth='2000-08-12', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=19; -- Yash Dayal
UPDATE players SET date_of_birth='2002-09-02', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=20; -- Rasikh Dar Salam
UPDATE players SET date_of_birth='2003-05-14', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=21; -- Suyash Sharma
UPDATE players SET date_of_birth='1997-06-22', nationality='Sri Lankan',   batting_style='Left-hand bat',  bowling_style='Right-arm fast-medium'  WHERE id=22; -- Nuwan Thushara
UPDATE players SET date_of_birth='2002-05-04', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=23; -- Mohit Rathee

-- ── KKR ────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1988-06-06', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=24; -- Ajinkya Rahane
UPDATE players SET date_of_birth='1994-12-25', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm fast-medium'  WHERE id=25; -- Venkatesh Iyer
UPDATE players SET date_of_birth='2004-08-03', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=26; -- Angkrish Raghuvanshi
UPDATE players SET date_of_birth='1989-09-12', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=27; -- Manish Pandey
UPDATE players SET date_of_birth='2001-11-28', nationality='Afghan',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=28; -- Rahmanullah Gurbaz
UPDATE players SET date_of_birth='1992-12-17', nationality='South African',batting_style='Left-hand bat',  bowling_style='Right-arm medium'       WHERE id=29; -- Quinton de Kock
UPDATE players SET date_of_birth='1988-05-26', nationality='West Indian',  batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=30; -- Sunil Narine
UPDATE players SET date_of_birth='1988-04-29', nationality='West Indian',  batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=31; -- Andre Russell
UPDATE players SET date_of_birth='1997-10-12', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm medium'       WHERE id=32; -- Rinku Singh
UPDATE players SET date_of_birth='1997-08-25', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=33; -- Ramandeep Singh
UPDATE players SET date_of_birth='1993-10-21', nationality='West Indian',  batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=34; -- Rovman Powell
UPDATE players SET date_of_birth='1987-06-18', nationality='English',      batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=35; -- Moeen Ali
UPDATE players SET date_of_birth='1991-08-29', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=36; -- Varun Chakravarthy
UPDATE players SET date_of_birth='2002-02-02', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=37; -- Harshit Rana
UPDATE players SET date_of_birth='1996-03-25', nationality='Australian',   batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=38; -- Spencer Johnson
UPDATE players SET date_of_birth='1993-11-16', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=39; -- Anrich Nortje
UPDATE players SET date_of_birth='1999-05-05', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=40; -- Vaibhav Arora
UPDATE players SET date_of_birth='1999-11-27', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=41; -- Umran Malik
UPDATE players SET date_of_birth='1997-05-28', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=42; -- Mayank Markande

-- ── CSK ────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1996-01-31', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=43; -- Ruturaj Gaikwad
UPDATE players SET date_of_birth='1991-08-18', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=44; -- Rahul Tripathi
UPDATE players SET date_of_birth='2004-05-30', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=45; -- Shaik Rasheed
UPDATE players SET date_of_birth='1995-04-04', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=46; -- Deepak Hooda
UPDATE players SET date_of_birth='2003-07-02', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=47; -- Andre Siddarth
UPDATE players SET date_of_birth='1981-07-07', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=48; -- MS Dhoni
UPDATE players SET date_of_birth='1991-07-08', nationality='New Zealander',batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=49; -- Devon Conway
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=50; -- Vansh Bedi
UPDATE players SET date_of_birth='1988-12-06', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=51; -- Ravindra Jadeja
UPDATE players SET date_of_birth='1993-06-26', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm fast-medium'  WHERE id=52; -- Shivam Dube
UPDATE players SET date_of_birth='1986-09-17', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=53; -- R Ashwin
UPDATE players SET date_of_birth='1998-06-06', nationality='English',      batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=54; -- Sam Curran
UPDATE players SET date_of_birth='2000-02-23', nationality='New Zealander',batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=55; -- Rachin Ravindra
UPDATE players SET date_of_birth='1991-01-26', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=56; -- Vijay Shankar
UPDATE players SET date_of_birth='2001-06-01', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=57; -- Anshul Kamboj
UPDATE players SET date_of_birth='1994-04-09', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=58; -- Jamie Overton
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=59; -- Ramakrishna Ghosh
UPDATE players SET date_of_birth='2003-07-12', nationality='Afghan',       batting_style='Left-hand bat',  bowling_style='Left-arm chinaman'      WHERE id=60; -- Noor Ahmad
UPDATE players SET date_of_birth='1994-02-22', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=61; -- Shreyas Gopal
UPDATE players SET date_of_birth='2003-07-06', nationality='Sri Lankan',   batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=62; -- Matheesha Pathirana
UPDATE players SET date_of_birth='1997-12-05', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=63; -- Khaleel Ahmed
UPDATE players SET date_of_birth='2001-10-04', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=64; -- Kamlesh Nagarkoti
UPDATE players SET date_of_birth='1996-01-06', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=65; -- Mukesh Choudhary
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm fast-medium'   WHERE id=66; -- Gurjapneet Singh
UPDATE players SET date_of_birth='1994-08-31', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=67; -- Nathan Ellis

-- ── MI ─────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1987-04-30', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=68; -- Rohit Sharma
UPDATE players SET date_of_birth='1990-09-22', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=69; -- Suryakumar Yadav
UPDATE players SET date_of_birth='2002-11-08', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=70; -- Tilak Varma
UPDATE players SET date_of_birth='2004-08-16', nationality='South African',batting_style='Left-hand bat',  bowling_style=NULL                     WHERE id=71; -- Bevan-John Jacobs
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=72; -- Robin Minz
UPDATE players SET date_of_birth='1997-06-24', nationality='South African',batting_style='Left-hand bat',  bowling_style='Right-arm medium'       WHERE id=73; -- Ryan Rickelton
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=74; -- Krishnan Shrijith
UPDATE players SET date_of_birth='1993-10-11', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=75; -- Hardik Pandya
UPDATE players SET date_of_birth='2002-06-02', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=76; -- Naman Dhir
UPDATE players SET date_of_birth='1999-11-21', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=77; -- Will Jacks
UPDATE players SET date_of_birth='2002-04-14', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=78; -- Raj Angad Bawa
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=79; -- Vignesh Puthur
UPDATE players SET date_of_birth='2005-05-15', nationality='Afghan',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=80; -- Allah Ghazanfar
UPDATE players SET date_of_birth='1987-07-23', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=81; -- Karn Sharma
UPDATE players SET date_of_birth='1992-02-05', nationality='New Zealander',batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=82; -- Mitchell Santner
UPDATE players SET date_of_birth='1993-12-06', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=83; -- Jasprit Bumrah
UPDATE players SET date_of_birth='1992-08-07', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=84; -- Deepak Chahar
UPDATE players SET date_of_birth='1989-07-22', nationality='New Zealander',batting_style='Right-hand bat', bowling_style='Left-arm fast-medium'   WHERE id=85; -- Trent Boult
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=86; -- Ashwani Kumar
UPDATE players SET date_of_birth='1994-02-21', nationality='English',      batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=87; -- Reece Topley
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=88; -- Satyanarayana Raju
UPDATE players SET date_of_birth='1999-09-24', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=89; -- Arjun Tendulkar
UPDATE players SET date_of_birth='1999-05-08', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=90; -- Lizaad Williams

-- ── DC ─────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='2004-06-14', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=91; -- Jake Fraser-McGurk
UPDATE players SET date_of_birth='2000-02-22', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=92; -- Harry Brook
UPDATE players SET date_of_birth='2001-08-11', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=93; -- Tristan Stubbs
UPDATE players SET date_of_birth='1984-07-13', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=94; -- Faf du Plessis
UPDATE players SET date_of_birth='1991-12-06', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=95; -- Karun Nair
UPDATE players SET date_of_birth='1992-04-18', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=96; -- KL Rahul
UPDATE players SET date_of_birth='2002-12-20', nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=97; -- Abishek Porel
UPDATE players SET date_of_birth='1998-03-20', nationality='South African',batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=98; -- Donovan Ferreira
UPDATE players SET date_of_birth='1994-01-20', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=99; -- Axar Patel
UPDATE players SET date_of_birth='2001-10-11', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=100; -- Ashutosh Sharma
UPDATE players SET date_of_birth='2004-08-28', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=101; -- Sameer Rizvi
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=102; -- Darshan Nalkande
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=103; -- Vipraj Nigam
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=104; -- Ajay Mandal
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=105; -- Manvanth Kumar
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=106; -- Tripurana Vijay
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=107; -- Madhav Tiwari
UPDATE players SET date_of_birth='1994-12-14', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm chinaman'      WHERE id=108; -- Kuldeep Yadav
UPDATE players SET date_of_birth='1990-01-30', nationality='Australian',   batting_style='Left-hand bat',  bowling_style='Left-arm fast'          WHERE id=109; -- Mitchell Starc
UPDATE players SET date_of_birth='1997-05-01', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=110; -- Mukesh Kumar
UPDATE players SET date_of_birth='1991-05-27', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm fast-medium'   WHERE id=111; -- T Natarajan
UPDATE players SET date_of_birth='1988-09-18', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=112; -- Mohit Sharma
UPDATE players SET date_of_birth='1991-04-11', nationality='Sri Lankan',   batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=113; -- Dushmantha Chameera

-- ── SRH ────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1993-12-29', nationality='Australian',   batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=114; -- Travis Head
UPDATE players SET date_of_birth='1996-09-12', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=115; -- Abhinav Manohar
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=116; -- Aniket Verma
UPDATE players SET date_of_birth='1987-06-08', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=117; -- Sachin Baby
UPDATE players SET date_of_birth='1991-07-04', nationality='South African',batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=118; -- Heinrich Klaasen
UPDATE players SET date_of_birth='1998-07-18', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm medium'       WHERE id=119; -- Ishan Kishan
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Left-hand bat',  bowling_style=NULL                     WHERE id=120; -- Atharva Taide
UPDATE players SET date_of_birth='2000-09-04', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=121; -- Abhishek Sharma
UPDATE players SET date_of_birth='2003-05-04', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=122; -- Nitish Kumar Reddy
UPDATE players SET date_of_birth='1999-12-13', nationality='Sri Lankan',   batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=123; -- Kamindu Mendis
UPDATE players SET date_of_birth='1992-03-31', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=124; -- Adam Zampa
UPDATE players SET date_of_birth='1999-08-03', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=125; -- Rahul Chahar
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm orthodox'      WHERE id=126; -- Zeeshan Ansari
UPDATE players SET date_of_birth='1993-05-08', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=127; -- Pat Cummins
UPDATE players SET date_of_birth='1990-09-03', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=128; -- Mohammed Shami
UPDATE players SET date_of_birth='1990-07-23', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=129; -- Harshal Patel
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=130; -- Simarjeet Singh
UPDATE players SET date_of_birth='1991-10-18', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=131; -- Jaydev Unadkat
UPDATE players SET date_of_birth='1995-07-31', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=132; -- Brydon Carse
UPDATE players SET date_of_birth=NULL,         nationality='Sri Lankan',   batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=133; -- Eshan Malinga

-- ── GT ─────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1999-09-08', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=134; -- Shubman Gill
UPDATE players SET date_of_birth='2001-07-19', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=135; -- Sai Sudharsan
UPDATE players SET date_of_birth='1993-02-08', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm leg-break'    WHERE id=136; -- Rahul Tewatia
UPDATE players SET date_of_birth='1996-04-07', nationality='West Indian',  batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=137; -- Sherfane Rutherford
UPDATE players SET date_of_birth='1990-09-08', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=138; -- Jos Buttler
UPDATE players SET date_of_birth='2003-04-07', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=139; -- Kumar Kushagra
UPDATE players SET date_of_birth='1997-08-04', nationality='Indian',       batting_style='Left-hand bat',  bowling_style=NULL                     WHERE id=140; -- Anuj Rawat
UPDATE players SET date_of_birth='1998-09-20', nationality='Afghan',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=141; -- Rashid Khan
UPDATE players SET date_of_birth='2000-10-05', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=142; -- Washington Sundar
UPDATE players SET date_of_birth='1995-01-24', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=143; -- M Shahrukh Khan
UPDATE players SET date_of_birth='1999-05-11', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=144; -- Mahipal Lomror
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=145; -- Nishant Sindhu
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=146; -- Arshad Khan
UPDATE players SET date_of_birth='1990-01-22', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=147; -- Jayant Yadav
UPDATE players SET date_of_birth='1997-06-06', nationality='New Zealander',batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=148; -- Glenn Phillips
UPDATE players SET date_of_birth='1999-09-01', nationality='Afghan',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=149; -- Karim Janat
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm orthodox'      WHERE id=150; -- Manav Suthar
UPDATE players SET date_of_birth='1998-12-11', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm orthodox'      WHERE id=151; -- Sai Kishore
UPDATE players SET date_of_birth='1995-05-25', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=152; -- Kagiso Rabada
UPDATE players SET date_of_birth='1994-03-13', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=153; -- Mohammed Siraj
UPDATE players SET date_of_birth='1996-08-19', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=154; -- Prasidh Krishna
UPDATE players SET date_of_birth='2000-02-06', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=155; -- Gerald Coetzee
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm fast-medium'   WHERE id=156; -- Gurnoor Brar
UPDATE players SET date_of_birth='1988-09-02', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=157; -- Ishant Sharma
UPDATE players SET date_of_birth='1995-04-15', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm fast-medium'   WHERE id=158; -- Kulwant Khejroliya

-- ── PBKS ───────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1994-12-06', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=159; -- Shreyas Iyer
UPDATE players SET date_of_birth='1991-03-30', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=160; -- Shashank Singh
UPDATE players SET date_of_birth='2000-05-13', nationality='Indian',       batting_style='Left-hand bat',  bowling_style=NULL                     WHERE id=161; -- Nehal Wadhera
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Left-hand bat',  bowling_style=NULL                     WHERE id=162; -- Harnoor Singh Pannu
UPDATE players SET date_of_birth='2003-02-28', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=163; -- Priyansh Arya
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=164; -- Pyla Avinash
UPDATE players SET date_of_birth='1996-06-04', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=165; -- Josh Inglis
UPDATE players SET date_of_birth='1995-11-18', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=166; -- Vishnu Vinod
UPDATE players SET date_of_birth='2002-01-12', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=167; -- Prabhsimran Singh
UPDATE players SET date_of_birth='1988-10-14', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=168; -- Glenn Maxwell
UPDATE players SET date_of_birth='1989-08-16', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=169; -- Marcus Stoinis
UPDATE players SET date_of_birth='2000-01-06', nationality='South African',batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=170; -- Marco Jansen
UPDATE players SET date_of_birth='1996-06-07', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=171; -- Harpreet Brar
UPDATE players SET date_of_birth='2001-03-20', nationality='Afghan',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=172; -- Azmatullah Omarzai
UPDATE players SET date_of_birth='1999-11-20', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=173; -- Aaron Hardie
UPDATE players SET date_of_birth='2005-06-04', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=174; -- Musheer Khan
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=175; -- Suryansh Shedge
UPDATE players SET date_of_birth='1990-07-23', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=176; -- Yuzvendra Chahal
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=177; -- Pravin Dubey
UPDATE players SET date_of_birth='2002-02-05', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=178; -- Arshdeep Singh
UPDATE players SET date_of_birth='1991-06-13', nationality='New Zealander',batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=179; -- Lockie Ferguson
UPDATE players SET date_of_birth='1999-10-02', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=180; -- Yash Thakur
UPDATE players SET date_of_birth='1998-02-04', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=181; -- Vijaykumar Vyshak
UPDATE players SET date_of_birth='1997-05-28', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=182; -- Kuldeep Sen
UPDATE players SET date_of_birth='1997-09-04', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=183; -- Xavier Bartlett

-- ── RR ─────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='2001-12-28', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm leg-break'    WHERE id=184; -- Yashasvi Jaiswal
UPDATE players SET date_of_birth='1994-12-27', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=185; -- Nitish Rana
UPDATE players SET date_of_birth='1996-12-26', nationality='West Indian',  batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=186; -- Shimron Hetmyer
UPDATE players SET date_of_birth='2003-06-07', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=187; -- Shubham Dubey
UPDATE players SET date_of_birth='2011-01-04', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=188; -- Vaibhav Sooryavanshi
UPDATE players SET date_of_birth='1994-11-11', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=189; -- Sanju Samson
UPDATE players SET date_of_birth='2001-07-26', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=190; -- Dhruv Jurel
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=191; -- Kunal Singh Rathore
UPDATE players SET date_of_birth='2004-10-07', nationality='South African',batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=192; -- Lhuan-dre Pretorius
UPDATE players SET date_of_birth='2001-11-10', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=193; -- Riyan Parag
UPDATE players SET date_of_birth='1997-07-14', nationality='Sri Lankan',   batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=194; -- Wanindu Hasaranga
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=195; -- Yudhvir Singh
UPDATE players SET date_of_birth='1995-04-01', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=196; -- Jofra Archer
UPDATE players SET date_of_birth='1999-08-05', nationality='Sri Lankan',   batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=197; -- Maheesh Theekshana
UPDATE players SET date_of_birth='1994-08-14', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=198; -- Akash Madhwal
UPDATE players SET date_of_birth='1996-12-20', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=199; -- Tushar Deshpande
UPDATE players SET date_of_birth='1993-02-18', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=200; -- Sandeep Sharma
UPDATE players SET date_of_birth='1999-11-17', nationality='South African',batting_style='Left-hand bat',  bowling_style='Left-arm fast'          WHERE id=201; -- Nandre Burger
UPDATE players SET date_of_birth='1999-05-09', nationality='Afghan',       batting_style='Left-hand bat',  bowling_style='Left-arm fast-medium'   WHERE id=202; -- Fazalhaq Farooqi
UPDATE players SET date_of_birth='2007-01-25', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=203; -- Kwena Maphaka

-- ── LSG ────────────────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1994-10-04', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=204; -- Aiden Markram
UPDATE players SET date_of_birth='1989-06-10', nationality='South African',batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=205; -- David Miller
UPDATE players SET date_of_birth='2000-12-20', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm leg-break'    WHERE id=206; -- Abdul Samad
UPDATE players SET date_of_birth='1991-10-20', nationality='Australian',   batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=207; -- Mitchell Marsh
UPDATE players SET date_of_birth='2001-04-10', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=208; -- Ayush Badoni
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=209; -- Himmat Singh
UPDATE players SET date_of_birth='2000-05-26', nationality='South African',batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=210; -- Matthew Breetzke
UPDATE players SET date_of_birth='1997-10-04', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Right-arm medium'       WHERE id=211; -- Rishabh Pant
UPDATE players SET date_of_birth='1995-10-02', nationality='West Indian',  batting_style='Left-hand bat',  bowling_style='Right-arm off-break'    WHERE id=212; -- Nicholas Pooran
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=213; -- Aryan Juyal
UPDATE players SET date_of_birth='1994-11-02', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=214; -- Shahbaz Ahmed
UPDATE players SET date_of_birth='1991-10-16', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=215; -- Shardul Thakur
UPDATE players SET date_of_birth='2003-11-18', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=216; -- Rajvardhan Hangargekar
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Left-arm orthodox'      WHERE id=217; -- Arshin Kulkarni
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm off-break'    WHERE id=218; -- Yuvraj Chaudhary
UPDATE players SET date_of_birth='2000-09-05', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm leg-break'    WHERE id=219; -- Ravi Bishnoi
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=220; -- M Siddharth
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=221; -- Digvesh Singh
UPDATE players SET date_of_birth='2001-03-28', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=222; -- Mayank Yadav
UPDATE players SET date_of_birth='1996-12-13', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=223; -- Avesh Khan
UPDATE players SET date_of_birth='1999-05-01', nationality='Indian',       batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=224; -- Akash Deep
UPDATE players SET date_of_birth='2001-06-14', nationality='West Indian',  batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=225; -- Shamar Joseph
UPDATE players SET date_of_birth=NULL,         nationality='Indian',       batting_style='Right-hand bat', bowling_style=NULL                     WHERE id=226; -- Prince Yadav
UPDATE players SET date_of_birth='2000-02-22', nationality='New Zealander',batting_style='Right-hand bat', bowling_style='Right-arm fast'         WHERE id=227; -- Will O'Rourke

-- ── Late additions ─────────────────────────────────────────────────────────────
UPDATE players SET date_of_birth='1997-11-06', nationality='Indian',       batting_style='Left-hand bat',  bowling_style='Left-arm orthodox'      WHERE id=228; -- Anukul Roy
UPDATE players SET date_of_birth='1996-03-29', nationality='South African',batting_style='Right-hand bat', bowling_style='Right-arm fast-medium'  WHERE id=229; -- Lungisani Ngidi
UPDATE players SET date_of_birth='1989-09-26', nationality='English',      batting_style='Right-hand bat', bowling_style='Right-arm medium'       WHERE id=230; -- Jonny Bairstow
