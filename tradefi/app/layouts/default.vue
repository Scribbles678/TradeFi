<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const route = useRoute()
const colorMode = useColorMode()

function getPageTitle() {
  const path = route.path
  
  // Main pages
  if (path === '/') return 'Dashboard'
  if (path === '/performance') return 'Performance'
  if (path === '/trade-settings') return 'Trade Settings'
  if (path === '/strategies') return 'Strategies'
  
  // Account pages
  if (path === '/account') return 'Account Overview'
  if (path === '/account/exchange-accounts') return 'Exchanges'
  if (path === '/account/webhook') return 'Webhook'
  if (path === '/account/subscription') return 'Subscription'
  
  // Fallback: try to get title from menu items
  const { MenuItems } = useMenuItems()
  const allMenuItems = [...MenuItems.value.navTrading, ...MenuItems.value.navAccount]
  const menuItem = allMenuItems.find(item => item.url === path)
  if (menuItem) {
    return menuItem.title
  }
  
  // Final fallback: capitalize route segments
  const segments = path.split('/').filter(Boolean)
  if (segments.length > 0) {
    return segments.map(seg => 
      seg.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(' > ')
  }
  
  return 'Page'
}

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <!-- Skip sidebar for login/register pages -->
  <div v-if="route.path === '/login' || route.path === '/register'" class="min-h-screen bg-background">
    <slot />
  </div>
  
  <!-- Main layout with template sidebar -->
  <div v-else class="bg-muted">
    <Toaster />
    <SidebarProvider>
      <AppSidebar variant="inset" />
      
      <SidebarInset class="border">
        <!-- Header -->
        <header class="flex h-16 w-full items-center justify-between gap-2 border-b border-border transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator
              orientation="vertical"
              class="mr-2 h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbLink href="#">
                    TradeFI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator class="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{{ getPageTitle() }}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div class="mr-4 flex items-center gap-2">
            <Badge variant="success" class="text-xs">
              Connected
            </Badge>
            <NotificationCenter />
            <Button
              variant="outline"
              size="icon"
              @click="toggleColorMode"
            >
              <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </Button>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <slot />
        </main>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
