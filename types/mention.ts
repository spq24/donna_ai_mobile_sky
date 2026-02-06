/**
 * Type definitions for @ mention functionality
 *
 * Supports two formats:
 * - Original format: @[Display Name](user_id)
 * - Library format (react-native-controlled-mentions): {@}[Display Name](user_id)
 */

export interface MentionUser {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface MentionData {
  user_id: number;
  display_name: string;
  start_index: number;
  end_index: number;
}

// Regex patterns for both mention formats
// Original format: @[Display Name](user_id)
export const MENTION_PATTERN = /@\[([^\]]+)\]\((\d+)\)/g;
// Library format: {@}[Display Name](user_id)
export const LIBRARY_MENTION_PATTERN = /\{@\}\[([^\]]+)\]\((\d+)\)/g;

/**
 * Parse mentions from content string (supports both formats)
 * Returns array of user IDs found in mentions
 */
export function parseMentions(content: string | null | undefined): number[] {
  if (!content) return [];

  const userIds: number[] = [];
  const seen = new Set<number>();

  // Try library format first: {@}[Name](id)
  const libraryPattern = /\{@\}\[([^\]]+)\]\((\d+)\)/g;
  let match;
  while ((match = libraryPattern.exec(content)) !== null) {
    const userId = parseInt(match[2], 10);
    if (!isNaN(userId) && !seen.has(userId)) {
      seen.add(userId);
      userIds.push(userId);
    }
  }

  // Also try original format: @[Name](id)
  const originalPattern = /@\[([^\]]+)\]\((\d+)\)/g;
  while ((match = originalPattern.exec(content)) !== null) {
    const userId = parseInt(match[2], 10);
    if (!isNaN(userId) && !seen.has(userId)) {
      seen.add(userId);
      userIds.push(userId);
    }
  }

  return userIds;
}

/**
 * Parse mentions with full data (including display names)
 * Supports both formats
 */
export function parseMentionsWithData(content: string | null | undefined): MentionData[] {
  if (!content) return [];

  const mentions: MentionData[] = [];

  // Parse library format: {@}[Name](id)
  const libraryPattern = /\{@\}\[([^\]]+)\]\((\d+)\)/g;
  let match;
  while ((match = libraryPattern.exec(content)) !== null) {
    mentions.push({
      user_id: parseInt(match[2], 10),
      display_name: match[1],
      start_index: match.index,
      end_index: match.index + match[0].length
    });
  }

  // Parse original format: @[Name](id)
  const originalPattern = /@\[([^\]]+)\]\((\d+)\)/g;
  while ((match = originalPattern.exec(content)) !== null) {
    // Check if this isn't already captured by library format
    const alreadyCaptured = mentions.some(
      m => m.start_index <= match!.index && match!.index < m.end_index
    );
    if (!alreadyCaptured) {
      mentions.push({
        user_id: parseInt(match[2], 10),
        display_name: match[1],
        start_index: match.index,
        end_index: match.index + match[0].length
      });
    }
  }

  // Sort by start_index
  mentions.sort((a, b) => a.start_index - b.start_index);

  return mentions;
}

/**
 * Format a user as a mention string (library format for mobile)
 */
export function formatMention(user: MentionUser): string {
  const displayName = user.full_name || user.email.split('@')[0];
  // Use library format for mobile
  return `{@}[${displayName}](${user.id})`;
}

/**
 * Format a user as a mention string (original format for web/backend)
 */
export function formatMentionOriginal(user: MentionUser): string {
  const displayName = user.full_name || user.email.split('@')[0];
  return `@[${displayName}](${user.id})`;
}

/**
 * Convert library format to original format for backend compatibility
 * {@}[Name](id) -> @[Name](id)
 */
export function convertToOriginalFormat(content: string | null | undefined): string {
  if (!content) return '';
  return content.replace(/\{@\}\[([^\]]+)\]\((\d+)\)/g, '@[$1]($2)');
}

/**
 * Convert original format to library format
 * @[Name](id) -> {@}[Name](id)
 */
export function convertToLibraryFormat(content: string | null | undefined): string {
  if (!content) return '';
  return content.replace(/@\[([^\]]+)\]\((\d+)\)/g, '{@}[$1]($2)');
}

/**
 * Convert mention format to plain text (for display)
 * Both formats -> @Name
 */
export function mentionToPlainText(content: string | null | undefined): string {
  if (!content) return '';
  // Handle both formats
  let result = content.replace(/\{@\}\[([^\]]+)\]\(\d+\)/g, '@$1');
  result = result.replace(/@\[([^\]]+)\]\(\d+\)/g, '@$1');
  return result;
}
