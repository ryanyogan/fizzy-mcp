<script setup lang="ts">
interface Props {
  columns?: number;
}

withDefaults(defineProps<Props>(), {
  columns: 3,
});
</script>

<template>
  <div class="feature-grid">
    <slot />
  </div>
</template>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin: 32px 0;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
