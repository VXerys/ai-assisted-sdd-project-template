import { parseBlocks, parseKeyValues, blockBody } from './markdown.mjs';

export const ASSUMPTION_STATUSES = ['open', 'confirmed', 'rejected'];

export function parseAssumptions(text) {
  return parseBlocks(text, 'A').map((block) => {
    const { fields, fieldLines, rest } = parseKeyValues(block.lines);
    return {
      id: block.id,
      title: block.title,
      line: block.line,
      status: fields.status ?? null,
      feature: fields.feature || null,
      raised: fields.raised || null,
      resolution: fields.resolution || null,
      fieldLines,
      body: blockBody(rest)
    };
  });
}
