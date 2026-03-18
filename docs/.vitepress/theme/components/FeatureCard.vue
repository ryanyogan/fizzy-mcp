<script setup lang="ts">
interface Props {
  icon?: string;
  title: string;
  description: string;
}

defineProps<Props>();
</script>

<template>
  <div class="feature-card">
    <div v-if="icon" class="feature-card-icon">{{ icon }}</div>
    <h3 class="feature-card-title">{{ title }}</h3>
    <p class="feature-card-description">{{ description }}</p>
  </div>
</template>

<style scoped>
.feature-card {
  border: 1px solid var(--vp-c-border);
  border-radius: 2px;
  padding: 24px;
  background-color: var(--vp-c-bg);
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.feature-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.feature-card-icon {
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.feature-card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

.feature-card-description {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}
</style>
