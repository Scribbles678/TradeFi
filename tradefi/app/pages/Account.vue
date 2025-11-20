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
                    <p class="text-lg font-semibold mt-1">{{ userProfile.name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p class="text-lg font-semibold mt-1">{{ userProfile.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                    <p class="text-lg font-semibold mt-1">{{ userProfile.joinDate }}</p>
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

            <!-- System Health Status -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5" />
                  <h3 class="text-lg font-semibold">System Health</h3>
                </div>
              </template>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Sparky Bot Status -->
                <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div class="flex-shrink-0">
                    <div :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      systemHealth.botOnline ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    ]">
                      <UIcon 
                        name="i-heroicons-server" 
                        :class="systemHealth.botOnline ? 'text-green-600' : 'text-red-600'" 
                        class="w-5 h-5" 
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Sparky Bot</p>
                    <p :class="[
                      'text-sm font-semibold',
                      systemHealth.botOnline ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ systemHealth.botOnline ? 'Online' : 'Offline' }}
                    </p>
                  </div>
                </div>

                <!-- Last Webhook -->
                <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <UIcon name="i-heroicons-bolt" class="text-blue-600 w-5 h-5" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Last Webhook</p>
                    <p class="text-sm font-semibold truncate">{{ systemHealth.lastWebhook }}</p>
                  </div>
                </div>

                <!-- API Connections -->
                <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div class="flex-shrink-0">
                    <div :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      connectedExchangesCount >= 3 ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
                    ]">
                      <UIcon 
                        name="i-heroicons-link" 
                        :class="connectedExchangesCount >= 3 ? 'text-green-600' : 'text-yellow-600'" 
                        class="w-5 h-5" 
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">API Connections</p>
                    <p class="text-sm font-semibold">{{ connectedExchangesCount }}/4 Active</p>
                  </div>
                </div>

                <!-- System Alerts -->
                <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div class="flex-shrink-0">
                    <div :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      systemHealth.alertsCount === 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                    ]">
                      <UIcon 
                        :name="systemHealth.alertsCount === 0 ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" 
                        :class="systemHealth.alertsCount === 0 ? 'text-green-600' : 'text-red-600'" 
                        class="w-5 h-5" 
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400">System Alerts</p>
                    <p :class="[
                      'text-sm font-semibold',
                      systemHealth.alertsCount === 0 ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ systemHealth.alertsCount === 0 ? 'No Issues' : `${systemHealth.alertsCount} Alert${systemHealth.alertsCount > 1 ? 's' : ''}` }}
                    </p>
                  </div>
                </div>
              </div>
            </UCard>

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
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold">{{ usage.exchangesUsed }}/{{ usage.exchangesLimit }}</p>
                      <UIcon 
                        v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) === 'warning'" 
                        name="i-heroicons-exclamation-triangle" 
                        class="w-4 h-4 text-yellow-500" 
                      />
                      <UIcon 
                        v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) === 'critical'" 
                        name="i-heroicons-exclamation-circle" 
                        class="w-4 h-4 text-red-500" 
                      />
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      :class="getUsageBarColor(usage.exchangesUsed, usage.exchangesLimit)"
                      class="h-2.5 rounded-full transition-all"
                      :style="{ width: `${getUsagePercent(usage.exchangesUsed, usage.exchangesLimit)}%` }"
                    ></div>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ usage.exchangesLimit === Infinity ? 'Unlimited' : `${Math.round(getUsagePercent(usage.exchangesUsed, usage.exchangesLimit))}% used` }}
                    </p>
                    <p v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) === 'critical'" class="text-xs text-red-600 font-semibold">
                      At limit!
                    </p>
                  </div>
                  <UButton
                    v-if="getUsageLevel(usage.exchangesUsed, usage.exchangesLimit) !== 'safe'"
                    label="Upgrade Plan"
                    size="xs"
                    variant="outline"
                    class="w-full mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    @click="activeTab = 'subscription'"
                  />
                </div>

                <!-- Strategies Used -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Active Strategies</p>
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold">{{ usage.strategiesUsed }}/{{ usage.strategiesLimit === Infinity ? '∞' : usage.strategiesLimit }}</p>
                      <UIcon 
                        v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) === 'warning'" 
                        name="i-heroicons-exclamation-triangle" 
                        class="w-4 h-4 text-yellow-500" 
                      />
                      <UIcon 
                        v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) === 'critical'" 
                        name="i-heroicons-exclamation-circle" 
                        class="w-4 h-4 text-red-500" 
                      />
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      :class="getUsageBarColor(usage.strategiesUsed, usage.strategiesLimit)"
                      class="h-2.5 rounded-full transition-all"
                      :style="{ width: `${getUsagePercent(usage.strategiesUsed, usage.strategiesLimit)}%` }"
                    ></div>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ usage.strategiesLimit === Infinity ? 'Unlimited' : `${Math.round(getUsagePercent(usage.strategiesUsed, usage.strategiesLimit))}% used` }}
                    </p>
                    <p v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) === 'critical'" class="text-xs text-red-600 font-semibold">
                      At limit!
                    </p>
                  </div>
                  <UButton
                    v-if="getUsageLevel(usage.strategiesUsed, usage.strategiesLimit) !== 'safe'"
                    label="Upgrade Plan"
                    size="xs"
                    variant="outline"
                    class="w-full mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    @click="activeTab = 'subscription'"
                  />
                </div>

                <!-- Webhooks This Month -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Webhooks (This Month)</p>
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold">{{ usage.webhooksUsed }}/{{ usage.webhooksLimit === Infinity ? '∞' : usage.webhooksLimit }}</p>
                      <UIcon 
                        v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) === 'warning'" 
                        name="i-heroicons-exclamation-triangle" 
                        class="w-4 h-4 text-yellow-500" 
                      />
                      <UIcon 
                        v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) === 'critical'" 
                        name="i-heroicons-exclamation-circle" 
                        class="w-4 h-4 text-red-500" 
                      />
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      :class="getUsageBarColor(usage.webhooksUsed, usage.webhooksLimit)"
                      class="h-2.5 rounded-full transition-all"
                      :style="{ width: `${getUsagePercent(usage.webhooksUsed, usage.webhooksLimit)}%` }"
                    ></div>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ usage.webhooksLimit === Infinity ? 'Unlimited' : `${Math.round(getUsagePercent(usage.webhooksUsed, usage.webhooksLimit))}% used` }}
                    </p>
                    <p v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) === 'critical'" class="text-xs text-red-600 font-semibold">
                      At limit!
                    </p>
                  </div>
                  <UButton
                    v-if="getUsageLevel(usage.webhooksUsed, usage.webhooksLimit) !== 'safe'"
                    label="Upgrade Plan"
                    size="xs"
                    variant="outline"
                    class="w-full mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    @click="activeTab = 'subscription'"
                  />
                </div>
              </div>
            </UCard>
          </div>

        <!-- Exchange Accounts Tab -->
        <div v-if="activeTab === 'exchange-accounts'" class="space-y-6">
            <!-- Add Exchange Button -->
            <div class="flex justify-end">
              <UButton
                icon="i-heroicons-plus"
                label="Add Exchange"
                size="md"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                @click="addExchange"
              />
            </div>

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
              <UButton
                icon="i-heroicons-arrow-path"
                label="Refresh"
                size="md"
                :loading="credentialsLoading"
                @click="loadCredentials"
              />
            </div>

            <!-- Security Notice -->
            <UCard class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div class="flex gap-3">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-blue-900 dark:text-blue-100">
                  <p class="font-semibold mb-1">Security Notice</p>
                  <p class="text-blue-800 dark:text-blue-200">
                    API credentials are stored in Supabase, encrypted at rest, and never exposed to the browser. Updates from this page flow directly to Sparky.
                  </p>
                </div>
              </div>
            </UCard>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UCard
                v-for="card in credentialCards"
                :key="card.key"
                class="space-y-2 compact-card"
              >
                <template #header>
                  <div class="flex items-start justify-between py-1 gap-3">
                    <div class="flex items-start gap-2 flex-1 min-w-0">
                      <UIcon :name="card.icon" class="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <h3 class="text-base font-semibold">{{ card.name }}</h3>
                          <div class="flex items-center gap-1.5">
                            <UIcon 
                              :name="getCredentialStatus(card.key).icon" 
                              :class="{
                                'text-green-500': getCredentialStatus(card.key).color === 'success',
                                'text-yellow-500': getCredentialStatus(card.key).color === 'warning',
                                'text-red-500': getCredentialStatus(card.key).color === 'error',
                                'text-gray-500': getCredentialStatus(card.key).color === 'neutral'
                              }"
                              class="w-4 h-4"
                            />
                            <UBadge :color="getCredentialStatus(card.key).color" size="xs">
                              {{ getCredentialStatus(card.key).label }}
                            </UBadge>
                          </div>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Last tested: {{ formatLastTested(credentialForms[card.key].lastTested) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <!-- Environment Buttons (Live/Paper) - Only show for non-aster exchanges -->
                      <div v-if="card.key !== 'aster'" class="flex items-center gap-2">
                        <button
                          @click="switchEnvironment(card.key, false)"
                          :class="[
                            'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                            !credentialForms[card.key].isLive 
                              ? 'bg-gray-900 dark:bg-gray-950 text-green-400 border-2 border-green-400 shadow-lg shadow-green-500/50' 
                              : 'bg-gray-800 dark:bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                          ]"
                        >
                          📄 Paper
                        </button>
                        <button
                          @click="switchEnvironment(card.key, true)"
                          :class="[
                            'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                            credentialForms[card.key].isLive 
                              ? 'bg-gray-900 dark:bg-gray-950 text-green-400 border-2 border-green-400 shadow-lg shadow-green-500/50' 
                              : 'bg-gray-800 dark:bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                          ]"
                        >
                          🔴 Live
                        </button>
                      </div>
                      <UButton
                        label="Test"
                        icon="i-heroicons-beaker"
                        variant="ghost"
                        size="xs"
                        :loading="testingCredential === card.key"
                        :disabled="!isCredentialConnected(card.key)"
                        @click="testConnection(card.key)"
                      />
                      <UButton
                        label="Delete"
                        variant="ghost"
                        color="error"
                        size="xs"
                        :loading="deletingCredential === card.key"
                        @click="deleteCredential(card.key)"
                      />
                      <UButton
                        label="Save"
                        icon="i-heroicons-check"
                        size="xs"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        :loading="savingCredential === card.key"
                        @click="saveCredential(card.key)"
                      />
                    </div>
                  </div>
                </template>

                <div class="space-y-2">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <UFormField label="Label">
                      <UInput
                        v-model="credentialForms[card.key].label"
                        placeholder="Account label"
                        size="sm"
                      />
                    </UFormField>

                    <UFormField :label="card.key === 'oanda' ? 'API Token' : 'API Key'">
                      <div class="relative">
                        <UInput
                          v-model="credentialForms[card.key].apiKey"
                          :type="credentialForms[card.key].showApiKey ? 'text' : 'password'"
                          placeholder="API key or token"
                          size="sm"
                          class="pr-10"
                        />
                        <button
                          type="button"
                          @click="credentialForms[card.key].showApiKey = !credentialForms[card.key].showApiKey"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <UIcon 
                            :name="credentialForms[card.key].showApiKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                            class="w-4 h-4"
                          />
                        </button>
                      </div>
                    </UFormField>

                    <UFormField label="Account ID" v-if="card.key !== 'tastytrade'">
                      <UInput
                        v-model="credentialForms[card.key].accountId"
                        placeholder="Account ID / Number"
                        size="sm"
                      />
                    </UFormField>

                    <UFormField label="API Secret" v-if="card.showApiSecret !== false">
                      <div class="relative">
                        <UInput
                          v-model="credentialForms[card.key].apiSecret"
                          :type="credentialForms[card.key].showApiSecret ? 'text' : 'password'"
                          placeholder="API secret (if required)"
                          size="sm"
                          class="pr-10"
                        />
                        <button
                          type="button"
                          @click="credentialForms[card.key].showApiSecret = !credentialForms[card.key].showApiSecret"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <UIcon 
                            :name="credentialForms[card.key].showApiSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                            class="w-4 h-4"
                          />
                        </button>
                      </div>
                    </UFormField>

                    <UFormField
                      label="Passphrase"
                      v-if="card.showPassphrase"
                    >
                      <div class="relative">
                        <UInput
                          v-model="credentialForms[card.key].passphrase"
                          :type="credentialForms[card.key].showPassphrase ? 'text' : 'password'"
                          placeholder="Optional passphrase"
                          size="sm"
                          class="pr-10"
                        />
                        <button
                          type="button"
                          @click="credentialForms[card.key].showPassphrase = !credentialForms[card.key].showPassphrase"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <UIcon 
                            :name="credentialForms[card.key].showPassphrase ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" 
                            class="w-4 h-4"
                          />
                        </button>
                      </div>
                    </UFormField>
                  </div>

                </div>
              </UCard>
            </div>
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
                  <div class="flex flex-col gap-3">
                    <div class="flex flex-col md:flex-row gap-2 items-stretch">
                      <UInput
                        v-model="credentialForms.webhook.extraMetadata.webhookUrl"
                        placeholder="https://your-sparky-bot/webhook"
                        class="flex-1"
                      />
                      <UButton
                        icon="i-heroicons-clipboard-document"
                        label="Copy URL"
                        size="sm"
                        variant="outline"
                        @click="copyWebhookUrl"
                      />
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        icon="i-heroicons-check"
                        label="Save Webhook URL"
                        size="sm"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        :loading="savingCredential === 'webhook'"
                        @click="saveCredential('webhook')"
                      />
                      <UButton
                        icon="i-heroicons-arrow-path"
                        label="Reset to Default"
                        size="sm"
                        variant="ghost"
                        @click="credentialForms.webhook.extraMetadata.webhookUrl = runtimeConfig.public?.sparkyWebhookUrl || 'http://localhost:3000/webhook'"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Webhook Secret</label>
                  <div class="flex flex-col gap-3">
                    <div class="flex flex-col md:flex-row gap-2 items-stretch">
                      <UInput
                        v-model="credentialForms.webhook.webhookSecret"
                        :type="showWebhookSecret ? 'text' : 'password'"
                        placeholder="Enter webhook secret"
                        class="flex-1"
                      />
                      <UButton
                        :icon="showWebhookSecret ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                        :label="showWebhookSecret ? 'Hide' : 'Show'"
                        size="sm"
                        variant="ghost"
                        @click="showWebhookSecret = !showWebhookSecret"
                      />
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        icon="i-heroicons-clipboard-document"
                        label="Copy Secret"
                        size="sm"
                        variant="outline"
                        @click="copyWebhookSecret"
                      />
                      <UButton
                        icon="i-heroicons-check"
                        label="Save Secret"
                        size="sm"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        :loading="savingCredential === 'webhook'"
                        @click="saveCredential('webhook')"
                      />
                      <UButton
                        icon="i-heroicons-arrow-path"
                        label="Regenerate"
                        size="sm"
                        variant="outline"
                        color="warning"
                        @click="regenerateWebhookSecret"
                      />
                      <UButton
                        icon="i-heroicons-trash"
                        label="Clear"
                        size="sm"
                        variant="ghost"
                        color="error"
                        :loading="deletingCredential === 'webhook'"
                        @click="deleteCredential('webhook')"
                      />
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      ⚠️ Keep your secret secure. Never share it publicly.
                    </p>
                  </div>
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
                      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
import { ref, reactive, computed, onMounted } from 'vue'

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

type CredentialKey = 'aster' | 'oanda' | 'tradier' | 'tastytrade' | 'webhook'

interface BotCredentialRecord {
  id: string
  label: string | null
  exchange: string
  environment: string | null
  account_id: string | null
  api_key: string | null
  api_secret: string | null
  passphrase: string | null
  webhook_secret: string | null
  extra_metadata: Record<string, any> | null
  updated_at: string | null
}

interface CredentialForm {
  id: string | null
  label: string
  environment: string
  isLive: boolean
  accountId: string
  apiKey: string
  apiSecret: string
  passphrase: string
  webhookSecret: string
  extraMetadata: Record<string, any>
  updatedAt?: string | null
  lastTested?: string | null
  testStatus?: 'success' | 'failed' | 'never' | null
  showApiKey?: boolean
  showApiSecret?: boolean
  showPassphrase?: boolean
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

// Get authenticated user
const user = useSupabaseUser()

// User Profile (from Supabase Auth)
const userProfile = computed(() => {
  if (!user.value) return { name: '', email: '', joinDate: '' }
  
  const createdAt = user.value.created_at ? new Date(user.value.created_at) : new Date()
  const joinDate = createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  
  return {
    name: user.value.email?.split('@')[0] || 'User',
    email: user.value.email || '',
    joinDate
  }
})

// Subscription (Mock Data)
const subscription = ref<Subscription>({
  plan: 'Pro',
  status: 'active',
  cost: '99.00',
  nextBilling: 'Mar 15, 2024',
  paymentMethod: '•••• •••• •••• 4242'
})

// Usage (Mock Data) - Set to show warning states
const usage = ref<Usage>({
  exchangesUsed: 3,  // 75% - safe (green)
  exchangesLimit: 4,
  strategiesUsed: 8,
  strategiesLimit: Infinity, // Unlimited (green)
  webhooksUsed: 1245,
  webhooksLimit: Infinity  // Unlimited (green)
})

// System Health
const systemHealth = ref({
  botOnline: true,
  lastWebhook: '2 min ago',
  alertsCount: 0
})

// Connected Exchanges Count
const connectedExchangesCount = computed(() => {
  let count = 0
  if (asterBalance.value.success) count++
  if (oandaBalance.value.success) count++
  if (tradierBalance.value.success) count++
  if (tastytradeBalance.value.success && !tastytradeBalance.value.disabled) count++
  return count
})

// Usage Helper Functions
function getUsagePercent(used: number, limit: number | typeof Infinity): number {
  if (limit === Infinity) return 100
  return Math.min((used / limit) * 100, 100)
}

function getUsageLevel(used: number, limit: number | typeof Infinity): 'safe' | 'warning' | 'critical' {
  if (limit === Infinity) return 'safe'
  const percent = (used / limit) * 100
  if (percent >= 100) return 'critical'
  if (percent >= 80) return 'warning'
  return 'safe'
}

function getUsageBarColor(used: number, limit: number | typeof Infinity): string {
  const level = getUsageLevel(used, limit)
  if (level === 'critical') return 'bg-red-600'
  if (level === 'warning') return 'bg-yellow-500'
  return 'bg-blue-600'
}

const credentialCards = [
  {
    key: 'aster' as const,
    name: 'Aster DEX',
    icon: 'i-simple-icons-bitcoin',
    showApiSecret: true,
    showPassphrase: false
  },
  {
    key: 'oanda' as const,
    name: 'OANDA',
    icon: 'i-heroicons-currency-dollar',
    showApiSecret: false
  },
  {
    key: 'tradier' as const,
    name: 'Tradier',
    icon: 'i-heroicons-chart-bar',
    showApiSecret: false
  },
  {
    key: 'tastytrade' as const,
    name: 'Tasty Trade',
    icon: 'i-heroicons-chart-line',
    showApiSecret: true,
    showPassphrase: true
  }
]

// Store BOTH Live and Paper credentials for each exchange
const credentialStore = reactive<Record<CredentialKey, { production: CredentialForm; practice: CredentialForm }>>({
  aster: {
    production: createCredentialForm('Aster DEX', 'production'),
    practice: createCredentialForm('Aster DEX', 'practice')
  },
  oanda: {
    production: createCredentialForm('OANDA', 'production'),
    practice: createCredentialForm('OANDA', 'practice')
  },
  tradier: {
    production: createCredentialForm('Tradier', 'production'),
    practice: createCredentialForm('Tradier', 'practice')
  },
  tastytrade: {
    production: createCredentialForm('Tasty Trade', 'production'),
    practice: createCredentialForm('Tasty Trade', 'practice')
  },
  webhook: {
    production: createCredentialForm('TradingView Webhook', 'production'),
    practice: createCredentialForm('TradingView Webhook', 'practice')
  }
})

// Expose the active form based on current environment toggle
const credentialForms = computed(() => {
  const forms: Record<CredentialKey, CredentialForm> = {} as any
  for (const key in credentialStore) {
    const exchangeKey = key as CredentialKey
    const env = credentialStore[exchangeKey].production.isLive ? 'production' : 'practice'
    forms[exchangeKey] = credentialStore[exchangeKey][env]
  }
  return forms
})

const environmentOptions = [
  { label: 'Production', value: 'production' },
  { label: 'Paper / Practice', value: 'practice' },
  { label: 'Sandbox', value: 'sandbox' }
]

const credentialsLoading = ref(false)
const savingCredential = ref<string | null>(null)
const deletingCredential = ref<string | null>(null)
const testingCredential = ref<string | null>(null)

// Show/Hide API Keys
const showWebhookSecret = ref(false)

const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const webhookUrl = computed(() => credentialForms.value.webhook.extraMetadata?.webhookUrl || runtimeConfig.public?.sparkyWebhookUrl || 'http://localhost:3000/webhook')
const webhookSecret = computed(() => credentialForms.value.webhook.webhookSecret || 'set-in-tradefi')

const webhookTemplate = computed(() => `{
  "secret": "${webhookSecret.value}",
  "exchange": "aster",
  "action": "buy",
  "symbol": "{{ticker}}"
}`)

const webhookActivity = ref<WebhookActivity>({
  received24h: 45,
  lastReceived: '2 minutes ago'
})

function createCredentialForm(defaultLabel: string, environment: string = 'production'): CredentialForm {
  return {
    id: null,
    label: defaultLabel,
    environment,
    isLive: environment === 'production', // true = Live (production), false = Paper (practice)
    accountId: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    webhookSecret: '',
    extraMetadata: { webhookUrl: '' },
    updatedAt: null,
    lastTested: null,
    testStatus: null,
    showApiKey: false,
    showApiSecret: false,
    showPassphrase: false
  }
}

const credentialCardMap = credentialCards.reduce<Record<string, (typeof credentialCards)[number]>>((acc, card) => {
  acc[card.key] = card
  return acc
}, {})

function credentialTitle(key: CredentialKey) {
  return credentialCardMap[key]?.name || 'TradingView Webhook'
}

function formatUpdatedAt(timestamp?: string | null) {
  if (!timestamp) return 'Never'
  return new Date(timestamp).toLocaleString()
}

function isCredentialConnected(key: CredentialKey) {
  const form = credentialForms.value[key]
  if (!form) return false
  if (key === 'webhook') {
    return Boolean(form.webhookSecret)
  }
  if (key === 'oanda' || key === 'tradier') {
    return Boolean(form.apiKey)
  }
  if (key === 'tastytrade') {
    return Boolean(form.apiKey || form.apiSecret)
  }
  return Boolean(form.apiKey && form.apiSecret)
}

function getCredentialStatus(key: CredentialKey): { color: 'success' | 'warning' | 'error' | 'neutral'; label: string; icon: string } {
  const form = credentialForms.value[key]
  if (!form) return { color: 'neutral', label: 'Not Configured', icon: 'i-heroicons-x-circle' }
  
  const hasCredentials = isCredentialConnected(key)
  
  if (!hasCredentials) {
    return { color: 'neutral', label: 'Not Configured', icon: 'i-heroicons-minus-circle' }
  }
  
  if (form.testStatus === 'success') {
    return { color: 'success', label: 'Connected & Tested', icon: 'i-heroicons-check-circle' }
  }
  
  if (form.testStatus === 'failed') {
    return { color: 'error', label: 'Connection Failed', icon: 'i-heroicons-x-circle' }
  }
  
  // Has credentials but not tested
  return { color: 'warning', label: 'Saved (Not Tested)', icon: 'i-heroicons-exclamation-triangle' }
}

function formatLastTested(timestamp?: string | null): string {
  if (!timestamp) return 'Never tested'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

async function loadCredentials() {
  credentialsLoading.value = true
  try {
    const response = await $fetch<{ data: BotCredentialRecord[] }>('/api/bot/credentials')
    response.data?.forEach(applyCredential)
  } catch (error) {
    console.error('Failed to load bot credentials', error)
    toast.add({
      title: 'Unable to load credentials',
      color: 'error',
      description: 'Check Supabase configuration and try again.'
    })
  } finally {
    credentialsLoading.value = false
  }
}

function applyCredential(record: BotCredentialRecord) {
  const key = record.exchange as CredentialKey
  if (!credentialStore[key]) {
    return
  }

  const environment = (record.environment || 'production') as 'production' | 'practice'
  const target = credentialStore[key][environment]
  
  target.id = record.id
  target.label = record.label || credentialTitle(key)
  target.environment = environment
  target.isLive = environment === 'production'
  target.accountId = record.account_id || ''
  target.apiKey = record.api_key || ''
  target.apiSecret = record.api_secret || ''
  target.passphrase = record.passphrase || ''
  target.webhookSecret = record.webhook_secret || target.webhookSecret
  target.extraMetadata = {
    webhookUrl: record.extra_metadata?.webhookUrl || '',
    ...record.extra_metadata
  }
  target.updatedAt = record.updated_at
  
  // Sync the isLive toggle between both environments for this exchange
  credentialStore[key].production.isLive = environment === 'production'
  credentialStore[key].practice.isLive = environment === 'production'
}

// Switch between Live and Paper environments
function switchEnvironment(key: CredentialKey, isLive: boolean) {
  // Update both environments to stay in sync
  credentialStore[key].production.isLive = isLive
  credentialStore[key].practice.isLive = isLive
  // Update environment field
  credentialStore[key].production.environment = isLive ? 'production' : 'practice'
  credentialStore[key].practice.environment = isLive ? 'production' : 'practice'
}

function resetCredentialForm(key: CredentialKey) {
  const productionDefaults = createCredentialForm(credentialTitle(key), 'production')
  const practiceDefaults = createCredentialForm(credentialTitle(key), 'practice')
  Object.assign(credentialStore[key].production, productionDefaults)
  Object.assign(credentialStore[key].practice, practiceDefaults)
}

async function saveCredential(key: CredentialKey) {
  const form = credentialForms.value[key]
  const currentEnv = form.isLive ? 'production' : 'practice'
  savingCredential.value = key
  try {
    const payload = {
      id: form.id,
      exchange: key,
      label: form.label,
      environment: currentEnv,
      accountId: form.accountId || null,
      apiKey: form.apiKey || null,
      apiSecret: form.apiSecret || null,
      passphrase: form.passphrase || null,
      webhookSecret: key === 'webhook' ? (form.webhookSecret || null) : null,
      extraMetadata: form.extraMetadata || {}
    }

    const response = await $fetch<{ success: boolean; credential: BotCredentialRecord }>('/api/bot/credentials', {
      method: 'POST',
      body: payload
    })

    applyCredential(response.credential)
    
    // Reset test status since credentials changed
    form.testStatus = null
    form.lastTested = null
    
    const envLabel = currentEnv === 'production' ? 'Live' : 'Paper'
    toast.add({
      title: `✓ ${credentialTitle(key)} (${envLabel}) Saved Successfully!`,
      description: 'Credentials stored securely. Click "Test" to verify connection.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error) {
    console.error('Failed to save credential', error)
    toast.add({
      title: `✗ Failed to Save ${credentialTitle(key)}`,
      color: 'error',
      icon: 'i-heroicons-x-circle',
      description: 'Please verify the values and try again.'
    })
  } finally {
    savingCredential.value = null
  }
}

async function testConnection(key: CredentialKey) {
  const form = credentialForms.value[key]
  testingCredential.value = key
  
  try {
    // Call the appropriate balance API to test the connection
    let apiEndpoint = ''
    switch (key) {
      case 'aster':
        apiEndpoint = '/api/balance/aster'
        break
      case 'oanda':
        apiEndpoint = '/api/balance/oanda'
        break
      case 'tradier':
        apiEndpoint = '/api/balance/tradier'
        break
      case 'tastytrade':
        apiEndpoint = '/api/balance/tastytrade'
        break
      default:
        throw new Error('Invalid exchange')
    }
    
    const response = await $fetch<ExchangeBalance>(apiEndpoint)
    
    if (response.success) {
      form.testStatus = 'success'
      form.lastTested = new Date().toISOString()
      
      toast.add({
        title: `✓ ${credentialTitle(key)} Connection Successful!`,
        description: `Connected successfully. Balance: $${response.balance?.toFixed(2) ?? 'N/A'}`,
        color: 'success',
        icon: 'i-heroicons-check-badge'
      })
    } else {
      form.testStatus = 'failed'
      form.lastTested = new Date().toISOString()
      
      toast.add({
        title: `✗ ${credentialTitle(key)} Connection Failed`,
        description: response.error || 'Unable to connect. Check your credentials.',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
    }
  } catch (error: any) {
    form.testStatus = 'failed'
    form.lastTested = new Date().toISOString()
    
    console.error('Connection test failed:', error)
    
    toast.add({
      title: `✗ ${credentialTitle(key)} Connection Error`,
      description: error?.data?.error || error?.message || 'Failed to test connection. Please try again.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    testingCredential.value = null
  }
}

async function deleteCredential(key: CredentialKey) {
  const form = credentialForms.value[key]
  const currentEnv = form.isLive ? 'production' : 'practice'
  const envLabel = currentEnv === 'production' ? 'Live' : 'Paper'
  
  if (key === 'webhook') {
    if (!confirm('Clear the stored webhook secret? Existing alerts will stop working.')) {
      return
    }
  } else if (!confirm(`Remove ${envLabel} credentials for ${credentialTitle(key)}? This action cannot be undone.`)) {
    return
  }

  deletingCredential.value = key
  try {
    await $fetch('/api/bot/credentials', {
      method: 'DELETE',
      query: { exchange: key, environment: currentEnv }
    })
    
    // Reset only the current environment's form
    const envKey = currentEnv as 'production' | 'practice'
    Object.assign(credentialStore[key][envKey], createCredentialForm(credentialTitle(key), currentEnv))
    
    toast.add({
      title: `✓ ${credentialTitle(key)} (${envLabel}) Removed`,
      description: 'Credentials have been deleted successfully.',
      color: 'warning',
      icon: 'i-heroicons-trash'
    })
  } catch (error) {
    console.error('Failed to delete credential', error)
    toast.add({
      title: `✗ Failed to Delete ${credentialTitle(key)}`,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
      description: 'Please try again in a moment.'
    })
  } finally {
    deletingCredential.value = null
  }
}

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
    
    // Update system health based on API errors
    systemHealth.value.alertsCount = hasErrors.value ? countErrors() : 0
  } catch (error) {
    console.error('Error loading balances:', error)
    systemHealth.value.alertsCount = 1
  } finally {
    isLoading.value = false
  }
}

// Count API connection errors
function countErrors(): number {
  let errors = 0
  if (!asterBalance.value.success) errors++
  if (!oandaBalance.value.success) errors++
  if (!tradierBalance.value.success) errors++
  if (!tastytradeBalance.value.disabled && !tastytradeBalance.value.success) errors++
  return errors
}

// Placeholder Functions
function addExchange() {
  console.log('Add Exchange clicked')
  // Switch to API Keys tab to add credentials
  activeTab.value = 'api-keys'
  toast.add({
    title: 'Add Exchange',
    description: 'Please configure your API keys in the API Keys tab.',
    color: 'info'
  })
}

function editProfile() {
  console.log('Edit Profile clicked')
  alert('Edit Profile - Coming Soon!')
}

function viewUsageDetails() {
  console.log('View Usage Details clicked')
  alert('Usage Details - Coming Soon!')
}


function viewDocs(exchange: string) {
  console.log(`View Documentation for ${exchange}`)
  alert(`View Documentation for ${exchange} - Coming Soon!`)
}

function copyWebhookUrl() {
  navigator.clipboard.writeText(webhookUrl.value).then(() => {
    alert('Webhook URL copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy webhook URL')
  })
}

function copyWebhookSecret() {
  navigator.clipboard.writeText(credentialForms.value.webhook.webhookSecret || '').then(() => {
    alert('Webhook secret copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy webhook secret')
  })
}

async function regenerateWebhookSecret() {
  if (!confirm('Are you sure you want to regenerate your webhook secret? This will invalidate your current TradingView alerts.')) {
    return
  }
  const currentEnv = credentialForms.value.webhook.isLive ? 'production' : 'practice'
  const envKey = currentEnv as 'production' | 'practice'
  credentialStore.webhook[envKey].webhookSecret = crypto.randomUUID?.() || Math.random().toString(36).slice(2, 18)
  await saveCredential('webhook')
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
  loadCredentials()
  setInterval(loadBalances, 30000)
})

definePageMeta({
  title: 'Account',
  description: 'Manage your account, API keys, webhooks, and subscription'
})
</script>

<style scoped>
.compact-card :deep(.UCard-body),
.compact-card :deep(> div:not(:first-child):not(:last-child)) {
  padding-bottom: 0.5rem !important;
}

.compact-card :deep(> div:last-child) {
  padding-bottom: 0.5rem !important;
}

/* Toggle ON state - Green background with glow */
.toggle-wrapper.toggle-on :deep(button),
.toggle-wrapper.toggle-on :deep([role="switch"]) {
  background-color: var(--color-green-500) !important;
  border-color: var(--color-green-400) !important;
  box-shadow: 0 0 12px 0 var(--color-green-500), 0 4px 24px 0 rgba(16, 185, 129, 0.4) !important;
}

/* Alternative selectors for checked state */
.toggle-wrapper :deep(button[aria-checked="true"]),
.toggle-wrapper :deep([role="switch"][aria-checked="true"]),
.toggle-wrapper :deep(button[data-state="checked"]),
.toggle-wrapper :deep([data-state="checked"]) {
  background-color: var(--color-green-500) !important;
  border-color: var(--color-green-400) !important;
  box-shadow: 0 0 12px 0 var(--color-green-500), 0 4px 24px 0 rgba(16, 185, 129, 0.4) !important;
}

/* Toggle handle when ON - bright white with shadow */
.toggle-wrapper.toggle-on :deep(button > *),
.toggle-wrapper.toggle-on :deep([role="switch"] > *) {
  background-color: white !important;
}

.toggle-wrapper :deep(button[aria-checked="true"] > *),
.toggle-wrapper :deep([role="switch"][aria-checked="true"] > *) {
  background-color: white !important;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.3);
}

/* Toggle OFF state - white glow for Paper */
.toggle-wrapper:not(.toggle-on) :deep(button),
.toggle-wrapper:not(.toggle-on) :deep([role="switch"]) {
  background-color: rgba(75, 85, 99, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 0 12px 0 rgba(255, 255, 255, 0.4), 0 4px 24px 0 rgba(255, 255, 255, 0.2) !important;
}

/* Toggle hover glow effect */
.toggle-wrapper:hover :deep(button),
.toggle-wrapper:hover :deep([role="switch"]) {
  box-shadow: 0 0 12px 0 var(--color-gold-400), 0 4px 32px 0 rgba(255, 215, 0, 0.3);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

/* Paper (OFF) state hover - enhanced white glow */
.toggle-wrapper:not(.toggle-on):hover :deep(button),
.toggle-wrapper:not(.toggle-on):hover :deep([role="switch"]) {
  border-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 0 16px 0 rgba(255, 255, 255, 0.6), 0 6px 32px 0 rgba(255, 255, 255, 0.4) !important;
}

.toggle-wrapper.toggle-on:hover :deep(button),
.toggle-wrapper.toggle-on:hover :deep([role="switch"]),
.toggle-wrapper:hover :deep(button[aria-checked="true"]),
.toggle-wrapper:hover :deep([role="switch"][aria-checked="true"]) {
  background-color: var(--color-green-600) !important;
  box-shadow: 0 0 16px 0 var(--color-green-500), 0 6px 32px 0 rgba(16, 185, 129, 0.6) !important;
  border-color: var(--color-green-400) !important;
}

/* Toggle container hover effect */
.toggle-container:hover {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}
</style> 