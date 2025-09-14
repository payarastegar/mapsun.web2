import JSEncrypt from './jsencrypt.js'
import * as cryptoJs from "crypto-js";

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQDVSJH9eSzqA5UlckU6imTs
jfjbnNGywH7dzcdrTJbT5bi+nCMKHAhQxuky365zuetikqaNjqIRRrB88Tml2Kvw
3N0gmUhHt7nxAQVYl90TJZ+FDIEwCuj/37jrvyEImqn/a4Pi4gC48+/1T04zt6GM
8Qi/ooYZPzWensPl4O+O1ZaWhV+Gwj7OhhmfBgevi+cwjoeVOzLs6mhAhDznUtmH
UnCVd+RwFSsw5i5XkZ4YYeujwm42aQc+vpI0KVGlmS4DIrqOGQqAAxmX1G1YT/aT
ury5YeEuLU9CR9iDDJxIUM+lOC3Jj3Duo63pyUeXZQCnf974EpOvoKu+T609TNNl
AgMBAAE=
-----END PUBLIC KEY-----`

class CryptoUtils {

    static RSAEncrypt(string, pubKey) {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(pubKey);

        return encrypt.encrypt(string)
    }

    static RSADecrypt(string, priKey) {
        var encrypt = new JSEncrypt();
        encrypt.setPrivateKey(priKey);

        return encrypt.decrypt(string)
    }

    static AESEncrypt(text, key) {
        key = key.padEnd(16, '0')
        const keyByte = cryptoJs.enc.Utf8.parse(key);
        const iv = cryptoJs.enc.Utf8.parse(key);

        const textByte = cryptoJs.enc.Utf8.parse(text)
        return cryptoJs.AES.encrypt(textByte, keyByte,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: cryptoJs.mode.CBC,
                padding: cryptoJs.pad.Pkcs7
            }).toString()
    }

    static AESDecrypt(cipherText, key) {
        try {
            key = key.padEnd(16, '0')
            const keyByte = cryptoJs.enc.Utf8.parse(key);
            const iv = cryptoJs.enc.Utf8.parse(key);

            return cryptoJs.enc.Utf8.stringify(cryptoJs.AES.decrypt(cipherText, keyByte,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: cryptoJs.mode.CBC,
                    padding: cryptoJs.pad.Pkcs7
                }))
        } catch (e) {

        }

        return ''
    }
}

export default CryptoUtils
