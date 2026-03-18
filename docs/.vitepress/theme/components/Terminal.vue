<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
  lines?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Terminal',
  lines: () => [],
});

const copied = ref(false);

function getCommandText(): string {
  return props.lines
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.replace(/^\$ /, ''))
    .join('\n');
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(getCommandText());
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

function parseLineType(line: string): 'prompt' | 'output' | 'comment' {
  if (line.startsWith('$ ')) return 'prompt';
  if (line.startsWith('#')) return 'comment';
  return 'output';
}

function formatLine(line: string): string {
  if (line.startsWith('$ ')) return line.slice(2);
  if (line.startsWith('#')) return line;
  return line;
}
</script>

<template>
  <div class="terminal">
    <div class="terminal-header">
      <div class="terminal-dots">
        <span class="terminal-dot"></span>
        <span class="terminal-dot"></span>
        <span class="terminal-dot"></span>
      </div>
      <span class="terminal-title">{{ title }}</span>
      <button class="terminal-copy" @click="copyToClipboard" :title="copied ? 'Copied!' : 'Copy'">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <div class="terminal-body">
      <span
        v-for="(line, index) in lines"
        :key="index"
        class="terminal-line"
        :class="parseLineType(line)"
      >
        {{ formatLine(line) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.terminal {
  border: 1px solid var(--vp-c-border);
  border-radius: 2px;
  overflow: hidden;
  margin: 24px 0;
  background-color: #0a0a0a;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #111111;
  border-bottom: 1px solid var(--vp-c-border);
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.terminal-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #333333;
}

.terminal-title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

.terminal-copy {
  background: none;
  border: 1px solid transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  border-radius: 2px;
  transition: all 0.15s;
}

.terminal-copy:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.terminal-body {
  padding: 16px;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.6;
  color: #e5e5e5;
}

.terminal-line {
  display: block;
}

.terminal-line.prompt::before {
  content: '$ ';
  color: var(--vp-c-brand-1);
}

.terminal-line.output {
  color: #a3a3a3;
}

.terminal-line.comment {
  color: #525252;
  font-style: italic;
}
</style>
