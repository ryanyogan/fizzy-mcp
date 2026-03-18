import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './custom.css';

// Import custom components
import Terminal from './components/Terminal.vue';
import FeatureCard from './components/FeatureCard.vue';
import FeatureGrid from './components/FeatureGrid.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components
    app.component('Terminal', Terminal);
    app.component('FeatureCard', FeatureCard);
    app.component('FeatureGrid', FeatureGrid);
  },
} satisfies Theme;
