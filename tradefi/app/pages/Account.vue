<template>
    <div class="space-y-6">
      <!-- Account Overview -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Account Overview</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <UIcon name="i-heroicons-user-circle" class="text-4xl text-primary-500" />
              <div>
                <h4 class="font-semibold">John Doe</h4>
                <p class="text-sm text-gray-500">john.doe@example.com</p>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-500">Account Type:</span>
                <span class="font-medium">Premium</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Member Since:</span>
                <span class="font-medium">January 2024</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Last Login:</span>
                <span class="font-medium">2 hours ago</span>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <h4 class="font-semibold">Security Settings</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Two-Factor Authentication</span>
                <UToggle v-model="twoFactorEnabled" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Email Notifications</span>
                <UToggle v-model="emailNotifications" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">SMS Notifications</span>
                <UToggle v-model="smsNotifications" />
              </div>
            </div>
          </div>
        </div>
      </UCard>
  
      <!-- API Keys -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">API Keys</h3>
            <UButton
              icon="i-heroicons-plus"
              label="Add API Key"
              size="md"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              @click="showAddApiKeyModal = true"
            />
          </div>
        </template>
        <UTable
          :columns="apiKeyColumns"
          :rows="apiKeys"
          :ui="{ td: { base: 'max-w-0' } }"
        >
          <template #permissions-data="{ row }">
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="permission in (row as any).permissions"
                :key="permission"
                color="neutral"
                variant="subtle"
              >
                {{ permission }}
              </UBadge>
            </div>
          </template>
          <template #actions-data="{ row }">
            <div class="flex space-x-2">
              <UButton
                icon="i-heroicons-pencil"
                size="sm"
                class="bg-gray-600 hover:bg-gray-700 text-white"
                @click="editApiKey(Number((row as any).id))"
              />
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                class="bg-red-600 hover:bg-red-700 text-white"
                @click="deleteApiKey(Number((row as any).id))"
              />
            </div>
          </template>
        </UTable>
      </UCard>
  
      <!-- Add API Key Modal -->
      <UModal v-model="showAddApiKeyModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Add New API Key</h3>
          </template>
  
          <form @submit.prevent="addApiKey" class="space-y-4">
            <UFormGroup label="API Key Name">
              <UInput v-model="newApiKey.name" placeholder="Enter API key name" />
            </UFormGroup>
  
            <UFormGroup label="Permissions">
              <USelect
                v-model="newApiKey.permissions"
                :options="permissionOptions"
                multiple
                placeholder="Select permissions"
              />
            </UFormGroup>
  
            <div class="flex justify-end gap-3">
              <UButton
                label="Cancel"
                size="md"
                class="bg-gray-600 hover:bg-gray-700 text-white"
                @click="showAddApiKeyModal = false"
              />
              <UButton
                type="submit"
                label="Add API Key"
                size="md"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              />
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const twoFactorEnabled = ref(true)
  const emailNotifications = ref(true)
  const smsNotifications = ref(false)
  const showAddApiKeyModal = ref(false)
  
  const apiKeyColumns = [
    {
      key: 'name',
      label: 'Name',
      id: 'name'
    },
    {
      key: 'key',
      label: 'API Key',
      id: 'key'
    },
    {
      key: 'permissions',
      label: 'Permissions',
      id: 'permissions'
    },
    {
      key: 'created',
      label: 'Created',
      id: 'created'
    },
    {
      key: 'actions',
      label: 'Actions',
      id: 'actions'
    }
  ]
  
  const permissionOptions = [
    'Read',
    'Trade',
    'Withdraw',
    'Manage API Keys'
  ]
  
  const apiKeys = [
    {
      id: 1,
      name: 'Trading Bot',
      key: '********************',
      permissions: ['Read', 'Trade'],
      created: '2024-01-15'
    },
    {
      id: 2,
      name: 'Backup Key',
      key: '********************',
      permissions: ['Read', 'Trade', 'Withdraw'],
      created: '2024-02-01'
    }
  ]
  
  const newApiKey = ref({
    name: '',
    permissions: []
  })
  
  const addApiKey = () => {
    console.log('Adding new API key:', newApiKey.value)
    showAddApiKeyModal.value = false
    newApiKey.value = { name: '', permissions: [] }
  }
  
  const editApiKey = (id: number) => {
    console.log('Editing API key:', id)
  }
  
  const deleteApiKey = (id: number) => {
    console.log('Deleting API key:', id)
  }
  </script> 