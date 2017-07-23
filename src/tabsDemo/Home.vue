<template>
  <div>
    <p>Hello！Happy！</p>
    <p>
      vue版本需要2.1.0+。
    </p>
    <div>状态计数：{{count}}</div>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        count: 0
      }
    },
    mounted(){
      this.timer = setInterval(() => {
        this.count++;
      }, 1000);
      // debugger;
    },
    beforeDestroy() {
      clearInterval(this.timer);
      // debugger;
    }
  }
</script>
