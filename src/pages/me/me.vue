<template>
  <div class="bigBox">
    <div class="userBox">
      <div class="topBox">
        <div class="picBox">
          <img src="@/assets/pics/用户头像.jpg" alt="用户头像">
        </div>
        <div class="editBox">
          <img src="@/assets/icons/编辑.png" alt="编辑图标">
        </div>
      </div>
      <div class="nameBox">Alex Sterling</div>
      <div class="job_EmailBox">Senior Product Designer / alex.sterling@taskflow.com</div>
      <div class="tagsBox">
        <div>UI</div>
        <div>Figma</div>
        <div>UX</div>
      </div>
      <div class="juziBox">"Simplicity is the ultimate sophistication."</div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped lang="scss">
.userBox{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.topBox{
  position: relative;
}
.picBox{
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  img{
    width: 100%;
  }
}
.editBox{
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #135bec;
  right:0;
  bottom:0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  img{
    width: 50%;
  }
}
</style>