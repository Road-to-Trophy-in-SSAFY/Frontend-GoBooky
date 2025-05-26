<template>
  <div class="comment-list">
    <div v-for="comment in comments" :key="comment.id" class="comment-wrapper">
      <CommentItem
        :comment="comment"
        :is-editing="editingCommentId === comment.id"
        :is-replying="replyingToCommentId === comment.id"
        :editing-reply-id="editingReplyId"
        :is-submitting="isSubmitting"
        @edit="$emit('edit-comment', comment.id)"
        @delete="$emit('delete-comment', comment.id)"
        @update="(content) => $emit('update-comment', comment.id, content)"
        @reply="$emit('reply-to-comment', comment.id)"
        @create-reply="(content) => $emit('create-reply', comment.id, content)"
        @edit-reply="$emit('edit-reply', $event)"
        @update-reply="(replyId, content) => $emit('update-reply', comment.id, replyId, content)"
        @delete-reply="(replyId) => $emit('delete-reply', comment.id, replyId)"
      />
    </div>
  </div>
</template>

<script setup>
import CommentItem from '@/components/comment/CommentItem.vue'

defineProps({
  comments: {
    type: Array,
    required: true,
  },
  editingCommentId: {
    type: [String, Number],
    default: null,
  },
  replyingToCommentId: {
    type: [String, Number],
    default: null,
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

defineEmits([
  'edit-comment',
  'delete-comment',
  'update-comment',
  'reply-to-comment',
  'create-reply',
  'edit-reply',
  'update-reply',
  'delete-reply',
])
</script>

<style scoped>
.comment-list {
  margin-top: 1rem;
}

.comment-wrapper {
  margin-bottom: 1.5rem;
}

.comment-wrapper:last-child {
  margin-bottom: 0;
}
</style>
