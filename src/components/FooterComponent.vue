<template>
  <mdui-navigation-bar class="footer" :value="$route.path">
    <mdui-navigation-bar-item
      value="/plants"
      @click="$router.push({ name: 'plants' })"
      data-tab-name="plants"
      >Рослини
      <mdui-icon-local-florist--outlined slot="icon"></mdui-icon-local-florist--outlined>
      <mdui-icon-local-florist slot="active-icon"></mdui-icon-local-florist>
    </mdui-navigation-bar-item>
    <mdui-navigation-bar-item
      value="/add-plant"
      @click="$router.push({ name: 'add-plant' })"
      data-tab-name="add-plant"
      >Додати рослину
      <mdui-icon-add-box--outlined slot="icon"></mdui-icon-add-box--outlined>
      <mdui-icon-add-box slot="active-icon"></mdui-icon-add-box>
    </mdui-navigation-bar-item>
    <mdui-navigation-bar-item
      value="/history"
      @click="$router.push({ name: 'history' })"
      data-tab-name="history"
      >Історія
      <mdui-icon-history slot="icon"></mdui-icon-history>
      <mdui-icon-history slot="active-icon"></mdui-icon-history>
    </mdui-navigation-bar-item>
    <mdui-navigation-bar-item
      value="/profile"
      @click="$router.push({ name: 'profile' })"
      data-tab-name="profile"
      >Профіль
      <mdui-icon-person--outlined slot="icon"></mdui-icon-person--outlined>
      <mdui-icon-person slot="active-icon"></mdui-icon-person>
    </mdui-navigation-bar-item>
  </mdui-navigation-bar>
</template>
<script setup>
import 'mdui/components/navigation-bar.js'
import 'mdui/components/navigation-bar-item.js'
import '@mdui/icons/local-florist--outlined.js'
import '@mdui/icons/local-florist.js'
import '@mdui/icons/person--outlined.js'
import '@mdui/icons/person.js'
import '@mdui/icons/add-box--outlined.js'
import '@mdui/icons/add-box.js'
import '@mdui/icons/history.js'
</script>
