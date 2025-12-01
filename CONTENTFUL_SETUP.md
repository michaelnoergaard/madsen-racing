# 📋 Contentful Setup Guide

Complete guide to setting up Contentful CMS for Madsen Racing website.

---

## 🔑 Step 1: Get Your Credentials

### 1.1 Create Contentful Account
1. Go to https://www.contentful.com/
2. Sign up for free
3. Create a new space called "Madsen Racing"

### 1.2 Get Space ID
1. In Contentful dashboard → **Settings** → **General settings**
2. Copy your **Space ID**
3. Add to `.env`:
   ```
   CONTENTFUL_SPACE_ID=your_space_id_here
   ```

### 1.3 Get Content Delivery API Token
1. Go to **Settings** → **API keys**
2. Click **Add API key**
3. Name it "Production Website"
4. Copy the **Content Delivery API - access token**
5. Add to `.env`:
   ```
   CONTENTFUL_ACCESS_TOKEN=your_token_here
   ```

### 1.4 Get Content Preview API Token (Optional)
1. Same screen as above
2. Copy the **Content Preview API - access token**
3. Add to `.env`:
   ```
   CONTENTFUL_PREVIEW_TOKEN=your_preview_token_here
   ```

### 1.5 Get Management API Token (For Setup Script)
1. Go to **Settings** → **CMA tokens**
2. Click **Generate personal token**
3. Name it "Setup Script"
4. Copy the token
5. Add to `.env`:
   ```
   CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
   ```

---

## 🚀 Step 2: Import Content Models

You have **3 options** to import the content models:

### Option A: Automated Script (Easiest) ⭐

```bash
# 1. Install dependencies
npm install contentful-management dotenv

# 2. Run the setup script
npm run setup:contentful
```

This will automatically create all 7 content models:
- ✅ Race
- ✅ Sponsor
- ✅ Page Content
- ✅ Driver Stats
- ✅ Media Item (NEW!) - Photos and images for the gallery
- ✅ Video (NEW!) - YouTube videos for the video gallery
- ✅ Press Photo (NEW!) - High-resolution photos for press/media

### Option B: Contentful CLI

```bash
# 1. Install Contentful CLI globally
npm install -g contentful-cli

# 2. Login to Contentful
contentful login

# 3. Import content models
contentful space import --space-id YOUR_SPACE_ID --content-file contentful-export.json
```

### Option C: Manual Creation

Follow the detailed field definitions in the main README.md

---

## 📝 Step 3: Add Content

### 3.1 Add a Test Race

1. Go to **Content** tab
2. Click **Add entry** → **Race**
3. Fill in:
   ```
   Title: DKM Runde 1
   Date: 2026-03-15
   Track: Roskilde Racing
   Location: Roskilde
   Country: Danmark
   Championship: Dansk Kart Mesterskab
   Season: 2026
   ```
4. Click **Publish**

### 3.2 Add Driver Stats

1. Click **Add entry** → **Driver Stats**
2. Fill in:
   ```
   Season: 2025
   Total Races: 24
   Wins: 6
   Podiums: 12
   Fastest Laps: 8
   Championship Position: 2
   Points: 345
   ```
3. Click **Publish**

### 3.3 Add a Sponsor

1. Upload a logo image first:
   - Go to **Media** tab → **Add asset**
   - Upload logo
   - Publish the asset

2. Click **Add entry** → **Sponsor**
3. Fill in:
   ```
   Name: Your Sponsor Name
   Logo: [Select uploaded asset]
   Website: https://example.com
   Tier: guld (or sølv/bronze)
   Active: Yes
   ```
4. Click **Publish**

### 3.4 Add Media Content (NEW!)

#### Add a Photo:
1. Upload image first: **Media** → **Add asset** → Upload photo → Publish
2. **Add entry** → **Media Item**
3. Fill in:
   ```
   Title: "Overtaking at Roskilde"
   Description: "Anton makes a beautiful pass on the inside"
   File: [Select uploaded image]
   Category: "racing-action"
   Date: [Photo date]
   Photographer: "Photo by Racing Media"
   Location: "Roskilde Racing"
   Featured: Yes
   ```
4. Click **Publish**

#### Add a Video:
1. **Add entry** → **Video**
2. Fill in:
   ```
   Title: "Race Highlights - DKM Runde 1"
   Description: "Best moments from Anton's race at Roskilde"
   YouTube Video ID: "dQw4w9WgXcQ" (from youtube.com/watch?v=dQw4w9WgXcQ)
   YouTube URL: "https://youtube.com/watch?v=dQw4w9WgXcQ"
   Category: "racing-action"
   Duration: 180
   Date: [Video date]
   Featured: Yes
   ```
3. Click **Publish**

#### Add a Press Photo:
1. Upload high-resolution image: **Media** → **Add asset** → Upload HD photo → Publish
2. **Add entry** → **Press Photo**
3. Fill in:
   ```
   Title: "Anton on Podium - DKM Championship"
   Description: "Official podium celebration photo"
   File: [Select HD image]
   Photographer: "Pro Photo Agency"
   Date Taken: [Date]
   Location: "Roskilde Racing"
   Event: "DKM Championship Final"
   Downloadable: Yes
   Usage Rights: "Free for editorial use with photo credit"
   ```
4. Click **Publish**

---

## ✅ Step 4: Test the Connection

### 4.1 Local Development

```bash
# Start the dev server
npm run dev

# Visit http://localhost:4321
```

You should now see your content from Contentful!

### 4.3 Test the Gallery

Visit `http://localhost:4321/galleri` to see:
- ✅ Featured images section (if any media items marked as "featured")
- ✅ Main photo gallery with all uploaded images
- ✅ Video highlights section (if any videos added)
- ✅ Category filtering ("ALLE", "RACING ACTION", "BEHIND SCENES", etc.)
- ✅ Responsive grid layout that works on mobile
- ✅ Lightbox when clicking on images

### 4.2 Verify API Connection

Test with this command:

```bash
# Test fetching races
curl "https://cdn.contentful.com/spaces/YOUR_SPACE_ID/entries?access_token=YOUR_ACCESS_TOKEN&content_type=race"
```

---

## 🔄 Step 5: GitHub Secrets

Add your credentials to GitHub for automatic deployments:

1. Go to https://github.com/michaelnoergaard/madsen-racing
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

```
CONTENTFUL_SPACE_ID
CONTENTFUL_ACCESS_TOKEN
CONTENTFUL_PREVIEW_TOKEN (optional)
```

---

## 📊 Content Model Reference

### Race
```
title            - Race name (e.g., "DKM Runde 1")
date             - Race date (2026-03-15)
track            - Track name (e.g., "Roskilde Racing")
location         - City (e.g., "Roskilde")
country          - Country (e.g., "Danmark")
championship     - Championship name
result           - Final position (1, 2, 3, etc.)
qualifying       - Qualifying position
fastestLap       - Did Anton get fastest lap? (Yes/No)
points           - Championship points earned
facebookEvent    - Facebook event URL
notes            - Additional notes
season           - Year (2024, 2025, 2026, 2027)
```

### Sponsor
```
name             - Sponsor name
logo             - Logo image (asset)
website          - Sponsor website URL
tier             - guld, sølv, or bronze
description      - About the sponsor
active           - Is this sponsor currently active?
```

### Page Content
```
slug             - URL slug (e.g., "om-anton")
title            - Page title
heroImage        - Header image (asset)
content          - Rich text content
seoDescription   - Meta description (max 160 chars)
```

### Driver Stats
```
season              - Year (e.g., "2025")
totalRaces          - Number of races
wins                - Number of wins
podiums             - Podium finishes (P1-P3)
fastestLaps         - Number of fastest laps
championshipPosition - Final championship position
points              - Total championship points
```

### Media Item (NEW!)
```
title              - Photo title (required)
description        - Photo description
file               - Image file (required)
category           - racing-action, behind-scenes, or professional (required)
date               - Photo date
tags               - Tags array (e.g., ["overtake", "podium"])
photographer       - Photographer name
location           - Where photo was taken
featured           - Show in featured section?
```

### Video (NEW!)
```
title              - Video title (required)
description        - Video description
youtubeVideoId     - YouTube video ID (required)
youtubeUrl         - Full YouTube video URL
thumbnail          - Custom thumbnail image
duration           - Video length in seconds
category           - racing-action, behind-scenes, professional, or interviews
date               - Video date
featured           - Show in featured section?
```

### Press Photo (NEW!)
```
title              - Photo title (required)
description        - Photo description
file               - High-resolution image (required)
photographer       - Photographer name (required)
date               - Date taken (required)
location           - Location (required)
event              - Event name
downloadable       - Allow downloads?
usageRights        - Usage rights information
```

---

## 🛠️ Troubleshooting

### "Invalid credentials"
- Double-check your tokens in `.env`
- Make sure you're using the **Delivery API** token, not Management API
- Tokens are case-sensitive

### "Content not showing"
- Make sure entries are **Published** (not just saved as draft)
- Check that `season` field matches (e.g., "2026")
- Clear browser cache and restart dev server

### "Cannot find module"
- Run `npm install` to install all dependencies
- Make sure you're in the project root directory

### Script errors
- Ensure `CONTENTFUL_MANAGEMENT_TOKEN` is set in `.env`
- Check that your token has proper permissions
- Try running with Node.js v18 or higher

---

## 📚 Additional Resources

- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/)
- [Content Management API](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Contentful CLI](https://github.com/contentful/contentful-cli)

---

## 🎯 Quick Start Summary

```bash
# 1. Get credentials from Contentful
# 2. Add to .env file
# 3. Install dependencies
npm install contentful-management dotenv

# 4. Run setup script
npm run setup:contentful

# 5. Add content in Contentful web UI
# 6. Test locally
npm run dev

# 7. Add secrets to GitHub
# 8. Push to GitHub - auto-deploy! 🚀
```

---

Need help? Check the main README.md or open an issue on GitHub!
