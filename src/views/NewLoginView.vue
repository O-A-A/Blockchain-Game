<template>
    <v-card class="mx-auto" max-width="400" elevation="10">
    <v-card-title class="text-h5 text-center">登录</v-card-title>

    <v-card-text>
      <v-form @submit.prevent="onSubmit">

        <v-text-field
          v-model="form.publicKey"
          label="公钥"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.privateKey"
          label="私钥"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.password"
          label="密码"
          type="password"
          prepend-inner-icon="mdi-shield-check"
          variant="outlined"
          required
        ></v-text-field>

        <!-- 登录按钮 -->
        <v-btn
          type="submit"
          block
          color="primary"
          size="large"
          :loading="loading"
        >
          登录
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref } from 'vue'
import CryptoJS from 'crypto-js';
import { Wallet } from 'ethers';

function GenerateCryptoText(privatekey, password) {
    const ciphertext = CryptoJS.AES.encrypt(privatekey, password).toString();
    return ciphertext;
}

function LoadCryptoTest(text, password) {
    const bytes = CryptoJS.AES.decrypt(text, password);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}

function VerifyKeyPair(privateKey, publicKey) {
    try {
        const wallet = new Wallet(privateKey);
        return wallet.publicKey.toLowerCase() === publicKey.toLowerCase();
    } catch (error) {
        console.error("Key verification failed:", error);
        return false;
    }
}

// 表单数据
const form = ref({
  privateKey: '',
  publicKey: '',
  password: ''
})

// 加载状态
const loading = ref(false)
const onSubmit = () => {
    console.log(form.value);
    const _saved_key = GenerateCryptoText(form.value.privateKey, form.value.password);
    console.log(_saved_key);
}
</script>