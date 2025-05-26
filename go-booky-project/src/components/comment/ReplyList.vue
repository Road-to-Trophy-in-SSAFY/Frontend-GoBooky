<template>
  <div class="reply-list">
    <div v-for="reply in replies" :key="reply.id" class="reply-wrapper">
      <ReplyItem
        :reply="reply"
        :is-editing="editingReplyId === reply.id"
        :is-submitting="isSubmitting"
        @edit="$emit('edit-reply', reply.id)"
        @update="(content) => $emit('update-reply', reply.id, content)"
        @delete="$emit('delete-reply', reply.id)"
      />
    </div>
  </div>
</template>

<script setup>
import ReplyItem from '@/components/comment/ReplyItem.vue'

defineProps({
  replies: {
    type: Array,
    required: true,
  },
  editingReplyId: {
    type: [String, Number],
    default: null,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit-reply', 'update-reply', 'delete-reply'])
</script>

<style scoped>
.reply-list {
  margin-left: 1rem;
  border-left: 2px solid #e5e7eb;
  padding-left: 1rem;
}

.reply-wrapper {
  margin-bottom: 1rem;
}

.reply-wrapper:last-child {
  margin-bottom: 0;
}
</style>
