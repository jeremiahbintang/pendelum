import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      // saving error
      console.error(e)
    }
  }


const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value
    } catch(e) {
      // error reading value
      console.error(e)
    }
  }


const removeData = async (key) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch(e) {
      // remove error
      console.error(e)
    }
}
  
  

const savePhoneNumber = async (phone_number) => {
    try {
        await storeData("phone_number", phone_number)
      } catch (e) {
        // saving error
        console.error(e)
      }
} 


const getPhoneNumber = async () => {
    try {
        const phone_number = await getData("phone_number")
        return phone_number
        } catch (e) {
        // saving error
        console.error(e)
      }
} 

const deletePhoneNumber = async () => {
    try {
         await removeData("phone_number")
        } catch (e) {
        // saving error
        console.error(e)
      }}
export {
    savePhoneNumber,
    getPhoneNumber,
    deletePhoneNumber
}