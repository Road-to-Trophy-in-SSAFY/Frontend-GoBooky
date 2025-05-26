<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <slot v-if="$slots.default" />
      <template v-else>
        {{ text }}
        <button @click="$emit('close')">닫기</button>
      </template>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'BaseModal' })
defineProps({ text: String })
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2.5rem;
  border-radius: 16px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease-out;
  transform: translateY(0);
}

.modal-backdrop.v-enter-active .modal-content,
.modal-backdrop.v-leave-active .modal-content {
  transition: all 0.3s ease-out;
}

.modal-backdrop.v-enter-from .modal-content,
.modal-backdrop.v-leave-to .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}

.modal-content p {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  line-height: 1.5;
}

button {
  margin-top: 0;
  background: #42b983;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

button:hover {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

button:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
