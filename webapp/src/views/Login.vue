<template>
    <section class="section login-section">
        <form>
            <h1 class="title is-1">
                Авторизация
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
                <label class="label" for="login">Почта:</label>
                <div class="control">
                    <input class="input" id="login" type="email" v-model="form.login" required/>
                </div>
            </div>
            <div class="field">
                <label class="label" for="password">Пароль:</label>
                <div class="control">
                    <input class="input" id="password" type="password" v-model="form.password" required/>
                </div>
            </div>


            <input class="button margin-bottom sign-up-btn" type="button" value="Регистрация" @click.prevent="signUp" />
            <input class="button is-primary margin-bottom" type="button" value="Войти" @click.prevent="logIn" />
        </form>
    </section>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import NeuroLayer from "../model/NeuroLayer"
    import Neuron from "../model/Neuron";
    import NeuroNet from "../model/NeuroNet";

    @Component
    export default class Login extends Vue {
        form : any = {
            login : "",
            password : ""
        };

        showSubmitFeedback: boolean = false;
        notifyText : string = "";
        notifyStatus : string = "is-danger";//or is-primary
        _oldNotify : number = -1;


        logIn(){
            if(this.validateForm()){
                this.$router.push("create");
                this.$store.commit("setLogin", this.form.login);
            }
        }
        signUp(){
            if(this.validateForm()){
                this.showNotification("Зарегестиророваны успешно!");
                this.$router.push("create");
                this.$store.commit("setLogin", this.form.login);
            }
        }

        showError(err : string) {
            if(this._oldNotify >= 0){
                clearTimeout(this._oldNotify);
            }

            this.notifyStatus = "is-danger";
            this.notifyText = err;
            this.showSubmitFeedback = true;
            this._oldNotify = setTimeout(() => {
                this.showSubmitFeedback = false;
            }, 5000);
        }

        showNotification(text : string) {
            if(this._oldNotify >= 0){
                clearTimeout(this._oldNotify);
            }

            this.notifyStatus = "is-primary";
            this.notifyText = text;
            this.showSubmitFeedback = true;
            this._oldNotify = setTimeout(() => {
                this.showSubmitFeedback = false;
            }, 5000);
        }

        validateForm() : boolean {
            this.form.login = this.form.login.trim();
            this.form.password = this.form.password.trim();

            if(!this.validateEmail(this.form.login)) {
                console.log("Не правильная почта!");
                this.showError(
                    `Почта введена не корректно!`
                );
                return false;
            }
            else if(!this.validatePass(this.form.password)) {
                console.log("Пароль не соответсвует требованием защиты!");
                this.showError(
                    `Пароль не соответсвует требованием защиты: \nСтрока должна содержать не менее 1 прописного алфавитного символа и должна быть длинее 6 символов!`
                );
                return false;
            }
            return true;
        }

        validateEmail(email : string) : boolean {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        validatePass(pass : string) : boolean {
            const mediumRegex = new RegExp("(?=.*[A-Z])(?=.{6,})");
            return mediumRegex.test(pass);
        }

    }
</script>

<style scoped>
    .sign-up-btn {
        margin-right: 20px;
    }
    .login-section {
        max-width: 600px;
        margin: auto;
    }
</style>