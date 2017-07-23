<template>

  <div>
    <h3>Tab B</h3>
    <textarea rows="10" cols="60" placeholder="输入一些文本作为当前Tab的状态"></textarea>
    <div>状态计数：{{count}}</div>
  </div>

</template>

<script>
  export default {
    name: 'TabB',
    data(){
      return {
        count: 0
      }
    },
    methods: {},
    mounted(){
      this.timer = setInterval(() => {
        this.count++;
      }, 1000);
      debugger
    },
    deactived() {
      debugger;
    },
    actived(){
      debugger;
    },
    beforeDestroy() {
      clearInterval(this.timer);
      debugger;
    }
  }

</script>
