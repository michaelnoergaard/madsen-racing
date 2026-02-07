# Guide: Creating Tags Manually in Contentful Web UI

## Context

This guide explains how to manually create Contentful Asset Tags using the web interface. This is useful for:
- Understanding what the automated script does
- Creating tags manually for testing
- Managing tags outside of the import workflow

## Step-by-Step Instructions

### 1. Navigate to Tags Section

1. Log in to Contentful web app (app.contentful.com)
2. Select your space (Madsen Racing)
3. In the left sidebar, click **"Tags"** (may be under a "Settings" or "More" menu)

### 2. Create a New Tag

1. Click the **"Create tag"** button (usually top-right)
2. Fill in the form fields:

#### Tag Name (Required)
- **Purpose**: Human-readable display name for the tag
- **Max length**: 255 characters
- **Examples**:
  - `galleri`
  - `featured`
  - `2025-season`
  - `Country: Denmark` (using grouping syntax)

#### Tag Visibility (Cannot be changed later!)

Two options:

**Private (default)**
- Only available via Management API
- For internal use only
- NOT available via Delivery API (won't appear on your website)

**Public** ⭐ (Recommended for website use)
- Available via both Management API and Delivery API
- Required if you want to filter assets on your website
- Choose this for tags that will be used to display content

#### Tag ID (Required)
- **Purpose**: Machine-readable identifier for the tag
- **Max length**: 64 characters
- **Format**: Typically lowercase, can use hyphens, underscores, colons, dots, or hash symbols
- **Examples**:
  - `galleri`
  - `featured-2025`
  - `country:denmark`
  - `section_hero`

3. Press **Enter** or click **"Create"** to save

### 3. Best Practices

#### Tag Naming
- Use **kebab-case** for IDs: `featured-2025`, `press-photos`
- Use **human-readable** names: "Featured 2025", "Press Photos"
- For grouping, use symbols in the name: `Country: Denmark`, `Section: Hero`

#### Visibility
- Use **Public** for any tags that will filter or organize content on your website
- Use **Private** for internal organizational tags (e.g., `needs-review`, `temp-import`)

#### Tag ID Guidelines
- Keep it short and meaningful
- Use consistent pattern (e.g., all lowercase with hyphens)
- Avoid spaces and special characters (except `-`, `_`, `:`, `.`, `#`)

### 4. Example Tags for Madsen Racing

Based on your website structure, here are useful tags:

| Tag Name | Tag ID | Visibility | Purpose |
|----------|--------|------------|---------|
| Galleri | `galleri` | Public | Images displayed in the gallery |
| Featured | `featured` | Public | Featured content on homepage |
| 2025 Season | `2025-season` | Public | Content from 2025 racing season |
| Press Photo | `press-photo` | Public | Official press photos |
| Racing Action | `racing-action` | Public | Action shots from races |
| Behind Scenes | `behind-scenes` | Public | Behind-the-scenes content |

### 5. Applying Tags to Assets (After Creation)

Once tags are created:

1. Go to **"Assets"** in the left sidebar
2. Select one or more assets
3. In the right panel, find **"Metadata"** section
4. Click **"Tags"** field
5. Select the tag(s) you want to apply
6. Click **"Publish"** to save changes

### 6. Troubleshooting

**Tag doesn't appear in dropdown**
- Ensure tag visibility is set to **Public**
- Check you're in the correct environment (master)
- Try refreshing the page

**Can't change tag visibility**
- Tag visibility is permanent after creation
- If wrong, delete and recreate the tag
- Note: Deleting a tag removes it from all assets

**Tag ID already exists**
- Tag IDs must be unique within a space
- Choose a different ID or check if tag already exists

## Related to Script Implementation

The script we just implemented (`scripts/upload-and-import-media.js`) does this automatically:

```javascript
const tag = await environment.createTag({
  name: 'galleri',           // Tag name from --tag flag
  id: 'galleri',             // Auto-generated from name (kebab-case)
  visibility: 'public'       // Always public for website use
});
```

When you run:
```bash
node scripts/upload-and-import-media.js /path/to/media --tag galleri,featured
```

The script creates:
- Tag name: `galleri`, ID: `galleri`, visibility: `public`
- Tag name: `featured`, ID: `featured`, visibility: `public`

And applies them to all uploaded assets.

## Quick Reference: Tag ID Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| Simple lowercase | `galleri` | Single word tags |
| Kebab-case | `featured-2025` | Multi-word tags |
| Colon grouping | `country:denmark` | Hierarchical/grouped tags |
| Hash prefix | `#hero` | Special/important tags |

## Summary

- **Tag Name**: Human-readable, what users see
- **Tag ID**: Machine identifier, used in code/API
- **Visibility**: Public = on website, Private = internal only
- **Best Practice**: Create tags with Public visibility for website content
