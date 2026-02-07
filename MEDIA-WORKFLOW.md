# Media File Storage and Import Workflow

## Recommended Storage Location

**Store media files in:** `/var/www/madsen-racing/media/`

This folder:
- ✅ Already exists and is gitignored (see `.gitignore` line 32)
- ✅ Matches the script's documented usage pattern
- ✅ Keeps media files separate from source code
- ✅ Prevents repository bloat

## Directory Structure

```
/var/www/madsen-racing/media/
├── Gokart/                    # Karting photos
├── 2024-season/               # Photos from 2024 races
├── 2025-season/               # Photos from 2025 races
├── Press-Photos/              # Official press photos
├── Team-Photos/               # Team and driver photos
└── Sponsors/                  # Sponsor-related media
```

### Organization Principles

1. **Group by season** (2024, 2025) for time-based organization
2. **Group by category** (racing, press, sponsors) for content-based organization
3. **Use descriptive names** - avoid generic names like `folder1`, `new folder`, `uploads`
4. **Keep it flat** - one level of subfolders is sufficient

## Import Workflow

### 1. Add Media Files

```bash
# Create a new category folder
mkdir -p /var/www/madsen-racing/media/2025-season

# Copy files to the folder (using scp, rsync, or direct upload)
# Example from local machine:
# scp -r /path/to/photos/* user@server:/var/www/madsen-racing/media/2025-season/
```

### 2. Test Import (Dry Run)

```bash
cd /var/www/madsen-racing
DRY_RUN=true node scripts/upload-and-import-media.js ./media/2025-season
```

### 3. Import to Contentful

```bash
node scripts/upload-and-import-media.js ./media/2025-season
```

### 4. Verify Import

Check Contentful dashboard to confirm:
- Assets are uploaded
- Media entries are created
- Entries are published

### 5. Clean Up (Optional)

```bash
# After successful import, optionally remove local files
rm -rf /var/www/madsen-racing/media/2025-season
```

## Alternative Import Sources

The script accepts both relative and absolute paths:

```bash
# Relative from project root
node scripts/upload-and-import-media.js ./media/Gokart

# Absolute path
node scripts/upload-and-import-media.js /home/michael/Downloads/racing-photos

# Different absolute location
node scripts/upload-and-import-media.js /tmp/media-import
```

## Best Practices

### ✅ DO:
- Use descriptive folder names
- Organize by season or category
- Test with DRY_RUN first
- Verify imports in Contentful
- Clean up local files after successful import
- Check git status to ensure media folder isn't tracked

### ❌ DON'T:
- Store media in `src/media/` (would be built into static site)
- Use `/tmp/` for persistent storage (files may be deleted)
- Create deep folder nesting (keeps paths simple)
- Commit media files to git (repository stays small)

## Verification

### Check folder is gitignored:
```bash
cd /var/www/madsen-racing
git status
# Should NOT show media/ folder as untracked
```

### Verify script can access files:
```bash
ls -la /var/www/madsen-racing/media/Gokart
# Should show your media files
```

## Troubleshooting

### Script can't find files:
```bash
# Use absolute path to avoid confusion
node scripts/upload-and-import-media.js /var/www/madsen-racing/media/Gokart
```

### Permission issues:
```bash
# Ensure files are readable
chmod -R 644 /var/www/madsen-racing/media/*
```

### Files showing in git status:
```bash
# Verify .gitignore has /media/ entry
cat .gitignore | grep media

# If not, add it:
echo "/media/" >> .gitignore
```
