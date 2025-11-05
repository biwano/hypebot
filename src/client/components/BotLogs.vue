<template>
  <div>
    <div class="d-flex align-center mb-2">
      <div class="text-caption mr-2">Levels:</div>
      <v-checkbox
        v-for="lvl in allLevels"
        :key="lvl"
        :label="lvl.toUpperCase()"
        :value="lvl"
        v-model="selectedLevels"
        density="compact"
        hide-details
        class="mr-2"
      />
    </div>

    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      item-key="id"
      class="elevation-1"
    >
      <template #item.log_text="{ item }">
        <span class="text-body-2">{{ item.log_text }}</span>
      </template>
      <template #item.log_level="{ item }">
        <v-chip :color="levelColor(item.log_level)" size="x-small" label>{{ item.log_level }}</v-chip>
      </template>
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  botId: string
}

const props = defineProps<Props>()

const headers = [
  { title: 'Time', key: 'created_at' },
  { title: 'Level', key: 'log_level', width: 100 },
  { title: 'Message', key: 'log_text', sortable: false },
]

const allLevels = ['debug', 'info', 'warn', 'error']
const selectedLevels = ref<string[]>(['info', 'warn', 'error']) // default: no debug

const items = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)

const formatDate = (dateString: string) => new Date(dateString).toLocaleString()

const levelColor = (lvl: string) => {
  switch (lvl) {
    case 'error': return 'error'
    case 'warn': return 'warning'
    case 'info': return 'info'
    default: return 'grey'
  }
}

async function fetchLogs() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    selectedLevels.value.forEach(l => params.append('levels', l))
    params.set('page', String(page.value))
    params.set('itemsPerPage', String(itemsPerPage.value))

    const res = await fetch(`/api/bots/${props.botId}/logs?` + params.toString())
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    items.value = json.data.items
    total.value = json.data.total
  } catch (e) {
    console.error('Failed to load logs', e)
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch([page, itemsPerPage, selectedLevels], fetchLogs)

onMounted(fetchLogs)
</script>
