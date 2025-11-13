<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Account</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your account, API keys, webhooks, and subscription</p>
      </div>
      <UButton
        v-if="activeTab === 'exchange-accounts'"
        icon="i-heroicons-arrow-path"
        label="Refresh"
        size="md"
        @click="loadBalances"
        :loading="isLoading"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      />
    </div>

    <!-- Tabs -->
    <div class="w-full">
      <!-- Tab Buttons -->
      <div class="flex gap-2 mb-6 border-b border-gray-700 dark:border-gray-600 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-4 py-3 font-semibold text-sm transition-all whitespace-nowrap border-b-2',
            activeTab === tab.key
              ? 'border-blue-500 text-blue-500 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </div>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
            <!-- User Profile & Subscription Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- User Profile Card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-user-circle" class="w-5 h-5" />
                    <h3 class="text-lg font-semibold">User Profile</h3>
                  </div>
                </template>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p class="text-lg font-semibold mt-1">{{ userProfile.name || 'John Doe' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p class="text-lg font-semibold mt-1">{{ userProfile.email || 'john@example.com' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                    <p class="text-lg font-semibold mt-1">{{ userProfile.joinDate || 'Jan 15, 2024' }}</p>
                  </div>
                  <UButton
                    label="Edit Profile"
                    icon="i-heroicons-pencil"
                    size="md"
                    class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                    @click="editProfile"
                  />
                </div>
              </UCard>

              <!-- Subscription Status Card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-credit-card" class="w-5 h-5" />
                    <h3 class="text-lg font-semibold">Subscription Status</h3>
                  </div>
                </template>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                    <div class="flex items-center gap-2 mt-1">
                      <p class="text-lg font-semibold">{{ subscription.plan || 'Pro' }}</p>
                      <UBadge :color="subscription.status === 'active' ? 'success' : 'warning'" size="sm">
                        {{ subscription.status === 'active' ? 'Active' : 'Inactive' }}
                      </UBadge>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Next Billing Date</p>
                    <p class="text-lg font-semibold mt-1">{{ subscription.nextBilling || 'Mar 15, 2024' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Monthly Cost</p>
                    <p class="text-lg font-semibold mt-1">${{ subscription.cost || '99.00' }}/mo</p>
                  </div>
                  <UButton
                    label="Manage Subscription"
                    icon="i-heroicons-cog-6-tooth"
                    size="md"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    @click="activeTab = 'subscription'"
                  />
                </div>
              </UCard>
            </div>

            <!-- Usage & Limits -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
                    <h3 class="text-lg font-semibold">Usage & Limits</h3>
                  </div>
                  <UButton
                    label="View Full Details"
                    variant="ghost"
                    size="sm"
                    @click="viewUsageDetails"
                  />
                </div>
              </template>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Exchanges Used -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Active Exchanges</p>
                    <p class="text-sm font-semibold">{{ usage.exchangesUsed }}/{{ usage.exchangesLimit }}</p>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      class="bg-blue-600 h-2.5 rounded-full transition-all"
                      :style="{ width: `${(usage.exchangesUsed / usage.exchangesLimit) * 100}%` }"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ usage.exchangesLimit === Infinity ? 'Unlimited' : `${Math.round((usage.exchangesUsed / usage.exchangesLimit) * 100)}% used` }}
                  </p>
                </div>

                <!-- Strategies Used -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Active Strategies</p>
                    <p class="text-sm font-semibold">{{ usage.strategiesUsed }}/{{ usage.strategiesLimit === Infinity ? '∞' : usage.strategiesLimit }}</p>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      v-if="usage.strategiesLimit !== Infinity"
                      class="bg-green-600 h-2.5 rounded-full transition-all"
                      :style="{ width: `${Math.min((usage.strategiesUsed / usage.strategiesLimit) * 100, 100)}%` }"
                    ></div>
                    <div 
                      v-else
                      class="bg-green-600 h-2.5 rounded-full w-full"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ usage.strategiesLimit === Infinity ? 'Unlimited' : `${Math.round((usage.strategiesUsed / usage.strategiesLimit) * 100)}% used` }}
                  </p>
                </div>

                <!-- Webhooks This Month -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Webhooks (This Month)</p>
                    <p class="text-sm font-semibold">{{ usage.webhooksUsed }}/{{ usage.webhooksLimit === Infinity ? '∞' : usage.webhooksLimit }}</p>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      v-if="usage.webhooksLimit !== Infinity"
                      class="bg-purple-600 h-2.5 rounded-full transition-all"
                      :style="{ width: `${Math.min((usage.webhooksUsed / usage.webhooksLimit) * 100, 100)}%` }"
                    ></div>
                    <div 
                      v-else
                      class="bg-purple-600 h-2.5 rounded-full w-full"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ usage.webhooksLimit === Infinity ? 'Unlimited' : `${Math.round((usage.webhooksUsed / usage.webhooksLimit) * 100)}% used` }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>

        <!-- Exchange Accounts Tab -->
        <div v-if="activeTab === 'exchange-accounts'" class="space-y-6">
            <!-- Total Portfolio Value -->
            <UCard>
              <div class="text-center py-6">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Portfolio Value</p>
                <p class="text-4xl font-bold">
                  ${{ totalBalance.toFixed(2) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Last updated: {{ lastUpdate }}
                </p>
              </div>
            </UCard>

    <!-- Exchange Balances -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Aster DEX (Crypto) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-simple-icons-bitcoin" class="text-orange-500" />
              Aster DEX
            </h3>
            <UBadge :color="asterBalance.success ? 'success' : 'error'" size="sm">
              {{ asterBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <p class="text-2xl font-bold mt-1">
              ${{ asterBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Available</p>
              <p class="font-semibold">${{ asterBalance.availableBalance?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Unrealized P&L</p>
              <p :class="[
                'font-semibold',
                (asterBalance.totalUnrealizedPnl ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ (asterBalance.totalUnrealizedPnl ?? 0) >= 0 ? '+' : '' }}${{ asterBalance.totalUnrealizedPnl?.toFixed(2) ?? '0.00' }}
              </p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Crypto</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">24/7 Trading</span></p>
          </div>
        </div>
      </UCard>

      <!-- OANDA (Forex) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-currency-dollar" class="text-green-500" />
              OANDA
            </h3>
            <UBadge :color="oandaBalance.success ? 'success' : 'error'" size="sm">
              {{ oandaBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <p class="text-2xl font-bold mt-1">
              ${{ oandaBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Margin Available</p>
              <p class="font-semibold">${{ oandaBalance.marginAvailable?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Unrealized P&L</p>
              <p :class="[
                'font-semibold',
                (oandaBalance.unrealizedPL ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ (oandaBalance.unrealizedPL ?? 0) >= 0 ? '+' : '' }}${{ oandaBalance.unrealizedPL?.toFixed(2) ?? '0.00' }}
              </p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Forex</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">24/5 Trading</span></p>
          </div>
        </div>
      </UCard>

      <!-- Tradier (Stocks) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="text-blue-500" />
              Tradier
            </h3>
            <UBadge :color="tradierBalance.success ? 'success' : 'error'" size="sm">
              {{ tradierBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Equity</p>
            <p class="text-2xl font-bold mt-1">
              ${{ tradierBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Cash Available</p>
              <p class="font-semibold">${{ tradierBalance.cashAvailable?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Market Value</p>
              <p class="font-semibold">${{ tradierBalance.totalMarketValue?.toFixed(2) ?? '---' }}</p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Stocks/Options</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">Market Hours</span></p>
          </div>
        </div>
      </UCard>

      <!-- Tasty Trade (Futures) - Only show if not disabled -->
      <UCard v-if="!tastytradeBalance.disabled">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-chart-line" class="text-indigo-500" />
              Tasty Trade
            </h3>
            <UBadge :color="tastytradeBalance.success ? 'success' : 'error'" size="sm">
              {{ tastytradeBalance.success ? 'Connected' : 'Error' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Equity</p>
            <p class="text-2xl font-bold mt-1">
              ${{ tastytradeBalance.balance?.toFixed(2) ?? '---' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">Available Funds</p>
              <p class="font-semibold">${{ tastytradeBalance.availableFunds?.toFixed(2) ?? '---' }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">Buying Power</p>
              <p class="font-semibold">${{ tastytradeBalance.buyingPower?.toFixed(2) ?? '---' }}</p>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500">Asset Class: <span class="font-semibold">Futures</span></p>
            <p class="text-xs text-gray-500">Market: <span class="font-semibold">Extended Hours</span></p>
          </div>
        </div>
      </UCard>
    </div>

            <!-- Error Messages -->
            <UCard v-if="hasErrors" class="border-red-500 border-2">
              <template #header>
                <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">Connection Errors</h3>
              </template>
              <div class="space-y-2">
                <div v-if="!asterBalance.success" class="text-sm">
                  <span class="font-semibold">Aster DEX:</span> {{ asterBalance.error }}
                </div>
                <div v-if="!oandaBalance.success" class="text-sm">
                  <span class="font-semibold">OANDA:</span> {{ oandaBalance.error }}
                </div>
                <div v-if="!tradierBalance.success" class="text-sm">
                  <span class="font-semibold">Tradier:</span> {{ tradierBalance.error }}
                </div>
                <div v-if="!tastytradeBalance.success && !tastytradeBalance.disabled" class="text-sm">
                  <span class="font-semibold">Tasty Trade:</span> {{ tastytradeBalance.error }}
                </div>
              </div>
            </UCard>
          </div>

        <!-- API Keys Tab -->
        <div v-if="activeTab === 'api-keys'" class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-semibold">Connect Your Exchange Accounts</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your API keys securely</p>
              </div>
            </div>

            <!-- Aster DEX -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-simple-icons-bitcoin" class="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 class="text-lg font-semibold">Aster DEX</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Crypto Futures</p>
                    </div>
                  </div>
                  <UBadge :color="apiKeys.aster?.connected ? 'success' : 'neutral'" size="sm">
                    {{ apiKeys.aster?.connected ? 'Connected' : 'Not Connected' }}
                  </UBadge>
                </div>
              </template>
              <div class="space-y-4">
                <div v-if="apiKeys.aster?.connected" class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Last validated:</span>
                    <span class="font-semibold">{{ apiKeys.aster?.lastValidated || '2 hours ago' }}</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">API Key:</span>
                      <div class="flex items-center gap-2">
                        <code class="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {{ showAsterKey ? apiKeys.aster?.apiKey : '••••••••••••••••' }}
                        </code>
                        <UButton
                          :icon="showAsterKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                          size="xs"
                          variant="ghost"
                          @click="showAsterKey = !showAsterKey"
                        />
                        <UButton
                          icon="i-heroicons-pencil"
                          size="xs"
                          variant="ghost"
                          @click="editApiKey('aster')"
                          label="Edit"
                        />
                        <UButton
                          icon="i-heroicons-trash"
                          size="xs"
                          variant="ghost"
                          color="error"
                          @click="deleteApiKey('aster')"
                          label="Delete"
                        />
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">API Secret:</span>
                      <div class="flex items-center gap-2">
                        <code class="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {{ showAsterSecret ? apiKeys.aster?.apiSecret : '••••••••••••••••' }}
                        </code>
                        <UButton
                          :icon="showAsterSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                          size="xs"
                          variant="ghost"
                          @click="showAsterSecret = !showAsterSecret"
                        />
                        <UButton
                          icon="i-heroicons-pencil"
                          size="xs"
                          variant="ghost"
                          @click="editApiKey('aster')"
                          label="Edit"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      icon="i-heroicons-arrow-path"
                      label="Test Connection"
                      size="sm"
                      variant="outline"
                      @click="testConnection('aster')"
                      :loading="testingConnection === 'aster'"
                    />
                    <UButton
                      icon="i-heroicons-document-text"
                      label="View Documentation"
                      size="sm"
                      variant="ghost"
                      @click="viewDocs('aster')"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect your Aster DEX account to start trading</p>
                  <UButton
                    icon="i-heroicons-plus"
                    label="Add API Key"
                    size="md"
                    class="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                    @click="addApiKey('aster')"
                  />
                  <UButton
                    icon="i-heroicons-document-text"
                    label="View Documentation"
                    size="md"
                    variant="ghost"
                    class="ml-2"
                    @click="viewDocs('aster')"
                  />
                </div>
              </div>
            </UCard>

            <!-- OANDA -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-green-500" />
                    <div>
                      <h3 class="text-lg font-semibold">OANDA</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Forex</p>
                    </div>
                  </div>
                  <UBadge :color="apiKeys.oanda?.connected ? 'success' : 'neutral'" size="sm">
                    {{ apiKeys.oanda?.connected ? 'Connected' : 'Not Connected' }}
                  </UBadge>
                </div>
              </template>
              <div class="space-y-4">
                <div v-if="apiKeys.oanda?.connected" class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Last validated:</span>
                    <span class="font-semibold">{{ apiKeys.oanda?.lastValidated || '5 days ago' }}</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">API Token:</span>
                      <div class="flex items-center gap-2">
                        <code class="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {{ showOandaKey ? apiKeys.oanda?.apiKey : '••••••••••••••••' }}
                        </code>
                        <UButton
                          :icon="showOandaKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                          size="xs"
                          variant="ghost"
                          @click="showOandaKey = !showOandaKey"
                        />
                        <UButton
                          icon="i-heroicons-pencil"
                          size="xs"
                          variant="ghost"
                          @click="editApiKey('oanda')"
                          label="Edit"
                        />
                        <UButton
                          icon="i-heroicons-trash"
                          size="xs"
                          variant="ghost"
                          color="error"
                          @click="deleteApiKey('oanda')"
                          label="Delete"
                        />
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">Account ID:</span>
                      <code class="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {{ apiKeys.oanda?.accountId || '101-001-28692540-001' }}
                      </code>
                    </div>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      icon="i-heroicons-arrow-path"
                      label="Test Connection"
                      size="sm"
                      variant="outline"
                      @click="testConnection('oanda')"
                      :loading="testingConnection === 'oanda'"
                    />
                    <UButton
                      icon="i-heroicons-document-text"
                      label="View Documentation"
                      size="sm"
                      variant="ghost"
                      @click="viewDocs('oanda')"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect your OANDA account to start trading</p>
                  <UButton
                    icon="i-heroicons-plus"
                    label="Add API Key"
                    size="md"
                    class="bg-green-600 hover:bg-green-700 text-white font-semibold"
                    @click="addApiKey('oanda')"
                  />
                  <UButton
                    icon="i-heroicons-document-text"
                    label="View Documentation"
                    size="md"
                    variant="ghost"
                    class="ml-2"
                    @click="viewDocs('oanda')"
                  />
                </div>
              </div>
            </UCard>

            <!-- Tradier -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-500" />
                    <div>
                      <h3 class="text-lg font-semibold">Tradier</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Stocks/Options</p>
                    </div>
                  </div>
                  <UBadge :color="apiKeys.tradier?.connected ? 'success' : 'neutral'" size="sm">
                    {{ apiKeys.tradier?.connected ? 'Connected' : 'Not Connected' }}
                  </UBadge>
                </div>
              </template>
              <div class="space-y-4">
                <div v-if="apiKeys.tradier?.connected" class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Last validated:</span>
                    <span class="font-semibold">{{ apiKeys.tradier?.lastValidated || '1 day ago' }}</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">API Token:</span>
                      <div class="flex items-center gap-2">
                        <code class="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {{ showTradierKey ? apiKeys.tradier?.apiKey : '••••••••••••••••' }}
                        </code>
                        <UButton
                          :icon="showTradierKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                          size="xs"
                          variant="ghost"
                          @click="showTradierKey = !showTradierKey"
                        />
                        <UButton
                          icon="i-heroicons-pencil"
                          size="xs"
                          variant="ghost"
                          @click="editApiKey('tradier')"
                          label="Edit"
                        />
                        <UButton
                          icon="i-heroicons-trash"
                          size="xs"
                          variant="ghost"
                          color="error"
                          @click="deleteApiKey('tradier')"
                          label="Delete"
                        />
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500 dark:text-gray-400">Account ID:</span>
                      <code class="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {{ apiKeys.tradier?.accountId || 'VA55402267' }}
                      </code>
                    </div>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      icon="i-heroicons-arrow-path"
                      label="Test Connection"
                      size="sm"
                      variant="outline"
                      @click="testConnection('tradier')"
                      :loading="testingConnection === 'tradier'"
                    />
                    <UButton
                      icon="i-heroicons-document-text"
                      label="View Documentation"
                      size="sm"
                      variant="ghost"
                      @click="viewDocs('tradier')"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect your Tradier account to start trading</p>
                  <UButton
                    icon="i-heroicons-plus"
                    label="Add API Key"
                    size="md"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    @click="addApiKey('tradier')"
                  />
                  <UButton
                    icon="i-heroicons-document-text"
                    label="View Documentation"
                    size="md"
                    variant="ghost"
                    class="ml-2"
                    @click="viewDocs('tradier')"
                  />
                </div>
              </div>
            </UCard>

            <!-- Tasty Trade -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-chart-line" class="w-6 h-6 text-indigo-500" />
                    <div>
                      <h3 class="text-lg font-semibold">Tasty Trade</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Futures</p>
                    </div>
                  </div>
                  <UBadge :color="apiKeys.tastytrade?.connected ? 'success' : 'neutral'" size="sm">
                    {{ apiKeys.tastytrade?.connected ? 'Connected' : 'Not Connected' }}
                  </UBadge>
                </div>
              </template>
              <div class="space-y-4">
                <div v-if="apiKeys.tastytrade?.connected" class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Last validated:</span>
                    <span class="font-semibold">{{ apiKeys.tastytrade?.lastValidated || 'Never' }}</span>
                  </div>
                  <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p class="text-sm text-yellow-800 dark:text-yellow-200">
                      <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
                      Note: Requires OAuth2 authentication
                    </p>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      icon="i-heroicons-arrow-path"
                      label="Test Connection"
                      size="sm"
                      variant="outline"
                      @click="testConnection('tastytrade')"
                      :loading="testingConnection === 'tastytrade'"
                    />
                    <UButton
                      icon="i-heroicons-document-text"
                      label="View Documentation"
                      size="sm"
                      variant="ghost"
                      @click="viewDocs('tastytrade')"
                    />
                    <UButton
                      icon="i-heroicons-trash"
                      label="Disconnect"
                      size="sm"
                      variant="ghost"
                      color="error"
                      @click="deleteApiKey('tastytrade')"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect your Tasty Trade account using OAuth2</p>
                  <UButton
                    icon="i-heroicons-lock-closed"
                    label="Connect with OAuth"
                    size="md"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    @click="addApiKey('tastytrade')"
                  />
                  <UButton
                    icon="i-heroicons-document-text"
                    label="View Documentation"
                    size="md"
                    variant="ghost"
                    class="ml-2"
                    @click="viewDocs('tastytrade')"
                  />
                </div>
              </div>
            </UCard>

            <!-- Security Notice -->
            <UCard class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div class="flex gap-3">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-blue-900 dark:text-blue-100">
                  <p class="font-semibold mb-1">Security Notice</p>
                  <p class="text-blue-800 dark:text-blue-200">
                    Your API keys are encrypted and stored securely. They are never logged or exposed in client-side code.
                  </p>
                </div>
              </div>
            </UCard>
          </div>

        <!-- Webhook Configuration Tab -->
        <div v-if="activeTab === 'webhook'" class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold">Your TradingView Webhook URL</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your webhook to receive TradingView alerts</p>
            </div>

            <!-- Webhook URL Card -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-link" class="w-5 h-5" />
                  <h3 class="text-lg font-semibold">Webhook Configuration</h3>
                </div>
              </template>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Webhook URL</label>
                  <div class="flex items-center gap-2">
                    <code class="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-sm break-all">
                      {{ webhookConfig.url || 'https://api.sparky.com/webhook/abc123xyz' }}
                    </code>
                    <UButton
                      icon="i-heroicons-clipboard-document"
                      label="Copy URL"
                      size="sm"
                      @click="copyWebhookUrl"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Webhook Secret</label>
                  <div class="flex items-center gap-2">
                    <code class="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-sm">
                      {{ showWebhookSecret ? webhookConfig.secret : '••••••••••••••••' }}
                    </code>
                    <UButton
                      :icon="showWebhookSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                      size="sm"
                      variant="ghost"
                      @click="showWebhookSecret = !showWebhookSecret"
                    />
                    <UButton
                      icon="i-heroicons-clipboard-document"
                      label="Copy Secret"
                      size="sm"
                      @click="copyWebhookSecret"
                    />
                    <UButton
                      icon="i-heroicons-arrow-path"
                      label="Regenerate"
                      size="sm"
                      variant="outline"
                      color="warning"
                      @click="regenerateWebhookSecret"
                    />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ⚠️ Keep your secret secure. Never share it publicly.
                  </p>
                </div>
              </div>
            </UCard>

            <!-- TradingView Setup Guide -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-academic-cap" class="w-5 h-5" />
                  <h3 class="text-lg font-semibold">TradingView Alert Setup</h3>
                </div>
              </template>
              <div class="space-y-4">
                <div class="space-y-2">
                  <p class="text-sm font-medium">Step-by-step instructions:</p>
                  <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>Go to your TradingView chart</li>
                    <li>Click "Create Alert" on the chart</li>
                    <li>Set your alert conditions</li>
                    <li>In the "Webhook URL" field, paste the webhook URL above</li>
                    <li>In the "Alert Message" field, use this JSON template:</li>
                  </ol>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">JSON Template</label>
                  <div class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{{ webhookTemplate }}</pre>
                  </div>
                  <div class="flex gap-2 mt-2">
                    <UButton
                      icon="i-heroicons-clipboard-document"
                      label="Copy Template"
                      size="sm"
                      @click="copyWebhookTemplate"
                    />
                    <UButton
                      icon="i-heroicons-document-text"
                      label="View Full Guide"
                      size="sm"
                      variant="ghost"
                      @click="viewWebhookGuide"
                    />
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Recent Webhook Activity -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-clock" class="w-5 h-5" />
                    <h3 class="text-lg font-semibold">Recent Webhook Activity</h3>
                  </div>
                  <UButton
                    label="View All Logs"
                    variant="ghost"
                    size="sm"
                    @click="viewWebhookLogs"
                  />
                </div>
              </template>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Last 24 hours:</span>
                  <span class="font-semibold">{{ webhookActivity.received24h || '45' }} webhooks received</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Status:</span>
                  <UBadge color="success" size="sm">All successful ✓</UBadge>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Last webhook:</span>
                  <span class="font-semibold">{{ webhookActivity.lastReceived || '2 minutes ago' }}</span>
                </div>
                <div class="pt-2">
                  <UButton
                    icon="i-heroicons-bolt"
                    label="Test Webhook"
                    size="sm"
                    variant="outline"
                    @click="testWebhook"
                  />
                </div>
              </div>
            </UCard>
          </div>

        <!-- Subscription Tab -->
        <div v-if="activeTab === 'subscription'" class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold">Subscription Management</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your plan and billing</p>
            </div>

            <!-- Current Plan -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-credit-card" class="w-5 h-5" />
                  <h3 class="text-lg font-semibold">Current Plan</h3>
                </div>
              </template>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-2xl font-bold">{{ subscription.plan || 'Pro' }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${{ subscription.cost || '99.00' }}/month</p>
                  </div>
                  <UBadge :color="subscription.status === 'active' ? 'success' : 'warning'" size="lg">
                    {{ subscription.status === 'active' ? 'Active' : 'Inactive' }}
                  </UBadge>
                </div>
                <div class="space-y-2 pt-2 border-t dark:border-gray-700">
                  <div class="flex items-center gap-2 text-sm">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                    <span>All Exchanges (4)</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                    <span>Unlimited Strategies</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                    <span>Unlimited Webhooks</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                    <span>Advanced Analytics</span>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700 text-sm">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Next billing:</p>
                    <p class="font-semibold">{{ subscription.nextBilling || 'Mar 15, 2024' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Payment method:</p>
                    <p class="font-semibold">{{ subscription.paymentMethod || '•••• •••• •••• 4242' }}</p>
                  </div>
                </div>
                <div class="flex gap-2 pt-2">
                  <UButton
                    label="Manage Subscription"
                    icon="i-heroicons-cog-6-tooth"
                    size="md"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    @click="manageSubscription"
                  />
                  <UButton
                    label="View Invoices"
                    icon="i-heroicons-document-text"
                    size="md"
                    variant="outline"
                    @click="viewInvoices"
                  />
                </div>
              </div>
            </UCard>

            <!-- Upgrade/Downgrade -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-arrows-up-down" class="w-5 h-5" />
                  <h3 class="text-lg font-semibold">Change Plan</h3>
                </div>
              </template>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Free Plan -->
                <UCard :class="subscription.plan === 'Free' ? 'border-2 border-blue-500' : ''">
                  <div class="space-y-3">
                    <div>
                      <p class="text-xl font-bold">Free</p>
                      <p class="text-2xl font-bold mt-1">$0<span class="text-sm font-normal">/mo</span></p>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>1 Exchange</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>3 Strategies</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>10 webhooks/hr</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Community Support</span>
                      </div>
                    </div>
                    <UButton
                      v-if="subscription.plan !== 'Free'"
                      label="Downgrade"
                      size="sm"
                      variant="outline"
                      class="w-full"
                      @click="changePlan('Free')"
                    />
                    <UButton
                      v-else
                      label="Current Plan"
                      size="sm"
                      disabled
                      class="w-full"
                    />
                  </div>
                </UCard>

                <!-- Basic Plan -->
                <UCard :class="subscription.plan === 'Basic' ? 'border-2 border-blue-500' : ''">
                  <div class="space-y-3">
                    <div>
                      <p class="text-xl font-bold">Basic</p>
                      <p class="text-2xl font-bold mt-1">$29<span class="text-sm font-normal">/mo</span></p>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>2 Exchanges</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>10 Strategies</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>100 webhooks/hr</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Email Support</span>
                      </div>
                    </div>
                    <UButton
                      v-if="subscription.plan !== 'Basic'"
                      :label="subscription.plan === 'Free' ? 'Upgrade' : subscription.plan === 'Pro' ? 'Downgrade' : 'Select'"
                      size="sm"
                      :class="subscription.plan === 'Free' ? 'bg-blue-600 hover:bg-blue-700 text-white w-full' : 'variant-outline w-full'"
                      @click="changePlan('Basic')"
                    />
                    <UButton
                      v-else
                      label="Current Plan"
                      size="sm"
                      disabled
                      class="w-full"
                    />
                  </div>
                </UCard>

                <!-- Pro Plan -->
                <UCard :class="subscription.plan === 'Pro' ? 'border-2 border-gold-500' : ''">
                  <div class="space-y-3">
                    <div>
                      <p class="text-xl font-bold">Pro</p>
                      <p class="text-2xl font-bold mt-1">$99<span class="text-sm font-normal">/mo</span></p>
                      <UBadge v-if="subscription.plan === 'Pro'" color="warning" size="sm" class="mt-1">Current</UBadge>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>All Exchanges (4)</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Unlimited Strategies</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Unlimited Webhooks</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Priority Support</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Advanced Analytics</span>
                      </div>
                    </div>
                    <UButton
                      v-if="subscription.plan !== 'Pro'"
                      label="Upgrade"
                      size="sm"
                      class="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      @click="changePlan('Pro')"
                    />
                    <UButton
                      v-else
                      label="Current Plan"
                      size="sm"
                      disabled
                      class="w-full"
                    />
                  </div>
                </UCard>
              </div>
              <template #footer>
                <div class="flex justify-end">
                  <UButton
                    label="Compare All Plans"
                    variant="ghost"
                    size="sm"
                    @click="comparePlans"
                  />
                  <UButton
                    label="View Enterprise Options"
                    variant="ghost"
                    size="sm"
                    class="ml-2"
                    @click="viewEnterprise"
                  />
                </div>
              </template>
            </UCard>

            <!-- Billing History -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
                  <h3 class="text-lg font-semibold">Billing History</h3>
                </div>
              </template>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b dark:border-gray-700">
                      <th class="text-left py-2 px-4 font-semibold">Date</th>
                      <th class="text-left py-2 px-4 font-semibold">Plan</th>
                      <th class="text-right py-2 px-4 font-semibold">Amount</th>
                      <th class="text-left py-2 px-4 font-semibold">Status</th>
                      <th class="text-right py-2 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in billingHistory" :key="invoice.id" class="border-b dark:border-gray-700">
                      <td class="py-2 px-4">{{ invoice.date }}</td>
                      <td class="py-2 px-4">{{ invoice.plan }}</td>
                      <td class="py-2 px-4 text-right font-semibold">${{ invoice.amount }}</td>
                      <td class="py-2 px-4">
                        <UBadge :color="invoice.status === 'paid' ? 'success' : 'warning'" size="sm">
                          {{ invoice.status === 'paid' ? 'Paid' : 'Pending' }}
                        </UBadge>
                      </td>
                      <td class="py-2 px-4 text-right">
                        <UButton
                          icon="i-heroicons-arrow-down-tray"
                          size="xs"
                          variant="ghost"
                          @click="downloadInvoice(invoice.id)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <template #footer>
                <div class="flex justify-end">
                  <UButton
                    label="View All Invoices"
                    variant="ghost"
                    size="sm"
                    @click="viewAllInvoices"
                  />
                </div>
              </template>
            </UCard>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ExchangeBalance {
  success: boolean
  exchange?: string
  balance?: number | null
  error?: string
  [key: string]: any
}

interface ApiKey {
  connected: boolean
  apiKey?: string
  apiSecret?: string
  accountId?: string
  lastValidated?: string
}

interface Subscription {
  plan: string
  status: string
  cost: string
  nextBilling: string
  paymentMethod?: string
}

interface Usage {
  exchangesUsed: number
  exchangesLimit: number | typeof Infinity
  strategiesUsed: number
  strategiesLimit: number | typeof Infinity
  webhooksUsed: number
  webhooksLimit: number | typeof Infinity
}

interface WebhookConfig {
  url: string
  secret: string
}

interface WebhookActivity {
  received24h: number
  lastReceived: string
}

interface BillingInvoice {
  id: string
  date: string
  plan: string
  amount: string
  status: 'paid' | 'pending'
}

// Tabs
type TabKey = 'overview' | 'exchange-accounts' | 'api-keys' | 'webhook' | 'subscription'

interface Tab {
  key: TabKey
  label: string
  icon: string
}

const tabs: Tab[] = [
  { key: 'overview', label: 'Overview', icon: 'i-heroicons-home' },
  { key: 'exchange-accounts', label: 'Exchange Accounts', icon: 'i-heroicons-currency-dollar' },
  { key: 'api-keys', label: 'API Keys', icon: 'i-heroicons-key' },
  { key: 'webhook', label: 'Webhook', icon: 'i-heroicons-link' },
  { key: 'subscription', label: 'Subscription', icon: 'i-heroicons-credit-card' }
]

const activeTab = ref<TabKey>('overview')

// User Profile
const userProfile = ref({
  name: 'John Doe',
  email: 'john@example.com',
  joinDate: 'Jan 15, 2024'
})

// Subscription (Mock Data)
const subscription = ref<Subscription>({
  plan: 'Pro',
  status: 'active',
  cost: '99.00',
  nextBilling: 'Mar 15, 2024',
  paymentMethod: '•••• •••• •••• 4242'
})

// Usage (Mock Data)
const usage = ref<Usage>({
  exchangesUsed: 2,
  exchangesLimit: 4,
  strategiesUsed: 8,
  strategiesLimit: Infinity,
  webhooksUsed: 1245,
  webhooksLimit: Infinity
})

// API Keys (Mock Data)
const apiKeys = ref<Record<string, ApiKey>>({
  aster: {
    connected: true,
    apiKey: 'aster_key_abc123xyz',
    apiSecret: 'aster_secret_xyz789abc',
    lastValidated: '2 hours ago'
  },
  oanda: {
    connected: false,
    lastValidated: 'Never'
  },
  tradier: {
    connected: true,
    apiKey: 'tradier_token_12345',
    accountId: 'VA55402267',
    lastValidated: '1 day ago'
  },
  tastytrade: {
    connected: false,
    lastValidated: 'Never'
  }
})

// Show/Hide API Keys
const showAsterKey = ref(false)
const showAsterSecret = ref(false)
const showOandaKey = ref(false)
const showTradierKey = ref(false)
const showWebhookSecret = ref(false)

// Webhook Config (Mock Data)
const webhookConfig = ref<WebhookConfig>({
  url: 'https://api.sparky.com/webhook/abc123xyz',
  secret: 'webhook_secret_xyz789abc'
})

const webhookTemplate = ref(`{
  "secret": "${webhookConfig.value.secret}",
  "exchange": "aster",
  "action": "buy",
  "symbol": "{{ticker}}"
}`)

const webhookActivity = ref<WebhookActivity>({
  received24h: 45,
  lastReceived: '2 minutes ago'
})

// Billing History (Mock Data)
const billingHistory = ref<BillingInvoice[]>([
  { id: '1', date: 'Feb 15, 2024', plan: 'Pro', amount: '99.00', status: 'paid' },
  { id: '2', date: 'Jan 15, 2024', plan: 'Pro', amount: '99.00', status: 'paid' },
  { id: '3', date: 'Dec 15, 2023', plan: 'Basic', amount: '29.00', status: 'paid' }
])

// State
const isLoading = ref(false)
const testingConnection = ref<string | null>(null)
const asterBalance = ref<ExchangeBalance>({ success: false })
const oandaBalance = ref<ExchangeBalance>({ success: false })
const tradierBalance = ref<ExchangeBalance>({ success: false })
const tastytradeBalance = ref<ExchangeBalance>({ success: false, disabled: false })
const lastUpdate = ref('')

// Computed
const totalBalance = computed(() => {
  let total = 0
  if (asterBalance.value.success && asterBalance.value.balance) total += asterBalance.value.balance
  if (oandaBalance.value.success && oandaBalance.value.balance) total += oandaBalance.value.balance
  if (tradierBalance.value.success && tradierBalance.value.balance) total += tradierBalance.value.balance
    // Only count Tasty Trade if it's not disabled
    if (!tastytradeBalance.value.disabled && tastytradeBalance.value.success && tastytradeBalance.value.balance) {
      total += tastytradeBalance.value.balance
    }
  return total
})

const hasErrors = computed(() => {
  // Don't count Tasty Trade if it's disabled
  const tastytradeOk = tastytradeBalance.value.disabled || tastytradeBalance.value.success
  return !asterBalance.value.success || !oandaBalance.value.success || !tradierBalance.value.success || !tastytradeOk
})

// Load balances from APIs
async function loadBalances() {
  isLoading.value = true
  try {
    // Fetch all balances in parallel
    const [aster, oanda, tradier, tastytrade] = await Promise.all([
      $fetch('/api/balance/aster').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/oanda').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/tradier').catch(e => ({ success: false, error: e.message })),
      $fetch('/api/balance/tastytrade').catch(e => ({ success: false, error: e.message, disabled: true }))
    ])

    asterBalance.value = aster as ExchangeBalance
    oandaBalance.value = oanda as ExchangeBalance
    tradierBalance.value = tradier as ExchangeBalance
    tastytradeBalance.value = tastytrade as ExchangeBalance

    lastUpdate.value = new Date().toLocaleString()
  } catch (error) {
    console.error('Error loading balances:', error)
  } finally {
    isLoading.value = false
  }
}

// Placeholder Functions
function editProfile() {
  console.log('Edit Profile clicked')
  alert('Edit Profile - Coming Soon!')
}

function viewUsageDetails() {
  console.log('View Usage Details clicked')
  alert('Usage Details - Coming Soon!')
}

function addApiKey(exchange: string) {
  console.log(`Add API Key for ${exchange}`)
  alert(`Add API Key for ${exchange} - Coming Soon!`)
}

function editApiKey(exchange: string) {
  console.log(`Edit API Key for ${exchange}`)
  alert(`Edit API Key for ${exchange} - Coming Soon!`)
}

function deleteApiKey(exchange: string) {
  if (!confirm(`Are you sure you want to delete the API key for ${exchange}?`)) {
    return
  }
  console.log(`Delete API Key for ${exchange}`)
  alert(`Delete API Key for ${exchange} - Coming Soon!`)
}

async function testConnection(exchange: string) {
  testingConnection.value = exchange
  console.log(`Test Connection for ${exchange}`)
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  alert(`Test Connection for ${exchange} - Coming Soon!`)
  testingConnection.value = null
}

function viewDocs(exchange: string) {
  console.log(`View Documentation for ${exchange}`)
  alert(`View Documentation for ${exchange} - Coming Soon!`)
}

function copyWebhookUrl() {
  navigator.clipboard.writeText(webhookConfig.value.url).then(() => {
    alert('Webhook URL copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy webhook URL')
  })
}

function copyWebhookSecret() {
  navigator.clipboard.writeText(webhookConfig.value.secret).then(() => {
    alert('Webhook secret copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy webhook secret')
  })
}

function regenerateWebhookSecret() {
  if (!confirm('Are you sure you want to regenerate your webhook secret? This will invalidate your current TradingView alerts.')) {
    return
  }
  console.log('Regenerate Webhook Secret')
  alert('Regenerate Webhook Secret - Coming Soon!')
}

function copyWebhookTemplate() {
  navigator.clipboard.writeText(webhookTemplate.value).then(() => {
    alert('Webhook template copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy webhook template')
  })
}

function viewWebhookGuide() {
  console.log('View Webhook Guide')
  alert('View Webhook Guide - Coming Soon!')
}

function viewWebhookLogs() {
  console.log('View Webhook Logs')
  alert('View Webhook Logs - Coming Soon!')
}

function testWebhook() {
  console.log('Test Webhook')
  alert('Test Webhook - Coming Soon!')
}

function manageSubscription() {
  console.log('Manage Subscription')
  alert('Manage Subscription - Coming Soon!')
}

function viewInvoices() {
  console.log('View Invoices')
  alert('View Invoices - Coming Soon!')
}

function changePlan(plan: string) {
  if (!confirm(`Are you sure you want to change to the ${plan} plan?`)) {
    return
  }
  console.log(`Change Plan to ${plan}`)
  subscription.value.plan = plan
  // Update cost based on plan
  if (plan === 'Free') {
    subscription.value.cost = '0.00'
    usage.value.exchangesLimit = 1
    usage.value.strategiesLimit = 3
    usage.value.webhooksLimit = 10
  } else if (plan === 'Basic') {
    subscription.value.cost = '29.00'
    usage.value.exchangesLimit = 2
    usage.value.strategiesLimit = 10
    usage.value.webhooksLimit = 100
  } else if (plan === 'Pro') {
    subscription.value.cost = '99.00'
    usage.value.exchangesLimit = 4
    usage.value.strategiesLimit = Infinity
    usage.value.webhooksLimit = Infinity
  }
  alert(`Plan changed to ${plan} - Coming Soon! (This is a placeholder)`)
}

function comparePlans() {
  console.log('Compare Plans')
  alert('Compare Plans - Coming Soon!')
}

function viewEnterprise() {
  console.log('View Enterprise Options')
  alert('Enterprise Options - Coming Soon!')
}

function downloadInvoice(invoiceId: string) {
  console.log(`Download Invoice ${invoiceId}`)
  alert(`Download Invoice ${invoiceId} - Coming Soon!`)
}

function viewAllInvoices() {
  console.log('View All Invoices')
  alert('View All Invoices - Coming Soon!')
}

// Load on mount and refresh every 30 seconds
onMounted(() => {
  loadBalances()
  setInterval(loadBalances, 30000)
})

definePageMeta({
  title: 'Account',
  description: 'Manage your account, API keys, webhooks, and subscription'
})
</script> 