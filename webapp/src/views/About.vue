<template>
  <section class="section about">
    <form>
      <h1 class="title is-1">
        Написать в поддержку
      </h1>


      <transition name="fade" mode="out-in">
        <article class="message" :class="notifyStatus" v-show="showSubmitFeedback">
          <div class="message-header">
            <p>Статус:</p>
          </div>
          <div class="message-body">
            {{notifyText}}
          </div>
        </article>
      </transition>

      <div class="field">
        <label class="label">Оглавление:</label>
        <div class="control">
          <input class="input" type="text" required/>
        </div>
      </div>
      <div class="field">
        <label class="label">Сообщение:</label>
        <div class="control">
          <textarea class="textarea">
          </textarea>
        </div>
      </div>


      <input class="button is-primary margin-bottom" type="button" value="Написать" @click.prevent="logIn" />
    </form>

    <br>
    <br>
    <h2 class="title is-2">Ответы</h2>

    <article class="message is-dark">
      <div class="message-header">
        <p>Ответ от Алексей</p>
        <button class="delete" aria-label="delete"></button>
      </div>
      <div class="message-body">
        Добрый вечер, чтобы обучить нейросеть вам всего лишь стоит перейти во вкладку создать,
        и выбрать нужные вам параметры. После того как откроется редактор, настройте нейроны, связи и функции,
        после чего можете начать обучать свою первую нейросеть.
        Удачи!
      </div>
    </article>


  </section>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import NeuroLayer from "../model/NeuroLayer"
  import Neuron from "../model/Neuron";
  import NeuroNet from "../model/NeuroNet";

  @Component
  export default class Login extends Vue {
    form: any = {
      login: "",
      password: ""
    };

    showSubmitFeedback: boolean = false;
    notifyText: string = "";
    notifyStatus: string = "is-danger";//or is-primary
    _oldNotify: number = -1;
  }
</script>