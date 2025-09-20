package com.biztech

import android.content.Context
import android.os.Build
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject

class SimInfoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SimInfo"

    @ReactMethod
    fun getSimNumbers(promise: Promise) {
        try {
            val simArray = JSONArray()

            val subscriptionManager = reactApplicationContext.getSystemService(
                Context.TELEPHONY_SUBSCRIPTION_SERVICE
            ) as SubscriptionManager?

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1 && subscriptionManager != null) {
                val subscriptionInfoList = subscriptionManager.activeSubscriptionInfoList
                if (!subscriptionInfoList.isNullOrEmpty()) {
                    for (info in subscriptionInfoList) {
                        val simInfo = JSONObject()
                        simInfo.put("slotIndex", info.simSlotIndex)
                        simInfo.put("carrierName", info.carrierName ?: "")
                        simInfo.put("displayName", info.displayName ?: "")

                        var number = info.number
                        if (number.isNullOrEmpty()) {
                            val telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
                            number = telephonyManager.line1Number ?: ""
                        }

                        simInfo.put("number", number)
                        simArray.put(simInfo)
                    }
                    promise.resolve(simArray.toString())
                    return
                }
            }

            // 3️⃣ Last fallback: TelephonyManager single SIM
            val telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
            val number = telephonyManager.line1Number ?: ""
            val simInfo = JSONObject()
            simInfo.put("slotIndex", 0)
            simInfo.put("carrierName", telephonyManager.networkOperatorName ?: "")
            simInfo.put("displayName", telephonyManager.simOperatorName ?: "")
            simInfo.put("number", number)
            simArray.put(simInfo)

            promise.resolve(simArray.toString())

        } catch (e: Exception) {
            promise.reject("SIM_ERROR", e.message, e)
        }
    }
}
