<script setup lang="ts">
import { Bell, Moon, Sun } from 'lucide-vue-next'

const route = useRoute()
const colorMode = useColorMode()

function getPageTitle() {
  const path = route.path
  
  if (path === '/') return 'Dashboard'
  if (path === '/performance') return 'Performance'
  if (path === '/trade-settings') return 'Trade Settings'
  if (path === '/strategies') return 'Strategies'
  if (path === '/account') return 'Account'
  
  // Fallback to capitalized route name
  return path.substring(1).charAt(0).toUpperCase() + path.substring(2) || 'Page'
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
            <Button
              variant="outline"
              size="icon"
            >
              <Bell class="h-4 w-4" />
            </Button>
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
