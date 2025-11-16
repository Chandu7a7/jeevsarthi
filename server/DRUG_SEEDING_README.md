# Drug Database Seeding Guide

## Overview
This script seeds the database with comprehensive livestock medicines including:
- Antibiotics (25+ medicines)
- Anthelmintics (Dewormers)
- Anti-inflammatory & Pain Relief
- Antipyretics
- Anti-parasitics (External)
- Anti-diarrheal / Gut Medicines
- Reproductive / Fertility Medicines
- Supportive Medicines
- Respiratory Medicines
- And more...

## How to Run

### Option 1: Using npm script (Recommended)
```bash
cd jeevsarthi/server
npm run seed-drugs
```

### Option 2: Direct node command
```bash
cd jeevsarthi/server
node scripts/seedDrugs.js
```

## What the Script Does

1. **Connects to MongoDB** using your `.env` configuration
2. **Seeds 80+ medicines** with proper:
   - Drug names (stored in UPPERCASE)
   - Categories (antibiotic, antiparasitic, vitamin, hormone, other)
   - Safe dosage limits
   - Withdrawal periods (milk & meat)
   - Risk levels (Low, Medium, High, Critical)
   - Banned status (for restricted drugs)
   - Toxicity information

3. **Updates existing drugs** if they already exist
4. **Creates new drugs** if they don't exist

## Important Notes

### Banned/Restricted Drugs
The following drugs are marked as **BANNED**:
- Chloramphenicol
- Colistin
- Nitrofurazone
- Furazolidone
- Diclofenac (for cattle)

### High Risk Drugs
These drugs have **High Risk Level**:
- Enrofloxacin, Ciprofloxacin, Levofloxacin, Norfloxacin
- Gentamicin, Streptomycin, Kanamycin, Amikacin
- Tetracycline, Penicillin G

## Search Functionality

After seeding, the medicine search will work as follows:
- Type **"C"** → Shows: Colistin, Ciprofloxacin, Ceftriaxone, Cefotaxime, Cephalexin, etc.
- Type **"O"** → Shows: Oxytetracycline, Oxytocin, Oxyclozanide, etc.
- Type **"Pen"** → Shows: Penicillin G
- Case-insensitive search
- Matches from start of word get priority

## Verification

After running the script, you can verify by:
1. Check the console output for created/updated counts
2. Use the medicine search in the frontend
3. Try searching for "C", "O", "Pen", etc.

## Troubleshooting

If you encounter errors:
1. Make sure MongoDB is running
2. Check your `.env` file has correct `MONGODB_URI`
3. Ensure you have proper database permissions
4. Check console output for specific error messages

