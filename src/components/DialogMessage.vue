<template>
  <v-dialog v-model="showDialog" max-width="400" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center">
        <v-icon
          :color="getColor()"
          size="large"
          class="mr-3"
        >
          {{ getIcon() }}
        </v-icon>
        <span class="text-h6">{{ dialogMessage?.title }}</span>
      </v-card-title>

      <v-card-text v-if="dialogMessage?.message" class="pt-2">
        <p class="text-body-1">{{ dialogMessage.message }}</p>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          @click="close"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialog } from '@/composables/useDialog'

const { dialogMessage, showDialog, close } = useDialog()

const getColor = () => {
  switch (dialogMessage.value?.type) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

const getIcon = () => {
  switch (dialogMessage.value?.type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    default:
      return 'mdi-information'
  }
}
</script>

