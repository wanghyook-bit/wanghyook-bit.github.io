#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/original-assets/project-decks"
DEST_DIR="$ROOT_DIR/assets/project-decks"

if ! command -v sips >/dev/null 2>&1; then
  printf '需要 macOS 自带的 sips 图片工具。\n' >&2
  exit 1
fi

if [ ! -d "$SOURCE_DIR" ]; then
  printf '找不到原始图片目录：%s\n' "$SOURCE_DIR" >&2
  exit 1
fi

count=0
while IFS= read -r -d '' source; do
  relative_path="${source#"$SOURCE_DIR"/}"
  target_path="$DEST_DIR/${relative_path%.*}.avif"
  mkdir -p "$(dirname "$target_path")"
  sips -s format avif -s formatOptions 78 -Z 2560 "$source" --out "$target_path" >/dev/null
  count=$((count + 1))
done < <(find "$SOURCE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -print0)

if [ "$count" -eq 0 ]; then
  printf '原始图片目录中没有找到可处理的图片。\n' >&2
  exit 1
fi

printf '已生成 %s 张网页图片，保存在 %s\n' "$count" "$DEST_DIR"
