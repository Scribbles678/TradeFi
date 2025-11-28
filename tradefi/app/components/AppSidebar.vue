<script setup lang="ts">
import type { SidebarProps } from './ui/sidebar'

const { MenuItems } = useMenuItems()

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <div class="flex items-center gap-3 px-2 py-2">
        <div class="bg-background text-primary flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
          <img 
            src="/Sparkyv2.png" 
            alt="SPARKY Logo" 
            class="h-8 w-8 object-contain"
          />
        </div>
        <div class="grid flex-1 text-left text-sm leading-tight min-w-0">
          <span class="truncate font-semibold text-sidebar-foreground">Sparky</span>
          <span class="truncate text-xs text-sidebar-foreground/70">Trading Platform</span>
        </div>
      </div>
    </SidebarHeader>
    
    <SidebarContent>
      <NavMain :items="MenuItems.navTrading" label="Trading" />
      <NavMain :items="MenuItems.navAccount" label="Account" />
    </SidebarContent>
    
    <SidebarFooter>
      <NavUser :user="MenuItems.user" />
    </SidebarFooter>
    
    <SidebarRail />
  </Sidebar>
</template>

