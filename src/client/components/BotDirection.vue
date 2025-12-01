<template>
  <DirectionDisplay
    label="Desired"
    :direction="desiredDirection * BASE_LEVERAGE"
  />
</template>

<script setup lang="ts">
import { BASE_LEVERAGE } from '../../shared/constants';
import DirectionDisplay from './DirectionDisplay.vue'

interface Props {
  desiredDirection: number
}

defineProps<Props>()
</script>
