<template lang="pug">
button#button1(@click='count++') A: {{ count }}
include ./dependency
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const count = ref(0);

    return {
      count,
    };
  },
};
</script>
