package com.rnmovableink

import com.facebook.react.bridge.*
import com.facebook.react.bridge.Callback
import com.movableink.inked.MIClient
import com.movableink.inked.MIClient.setMIU
import com.movableink.inked.inAppMessage.MovableInAppClient

class RNMovableInkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun start() {
    MIClient.start()
  }

  @ReactMethod
  fun setMIU(value: String) {
    MIClient.setMIU(value)
  }

  @ReactMethod
  fun identifyUser() {
    MIClient.identifyUser()
  }

  @ReactMethod
  fun resolveURL(url: String, promise: Promise) {
    MIClient.resolveUrlAsync(url) { resolved ->
      promise.resolve(resolved)
    }
  }

  @ReactMethod
  fun productSearched(properties: ReadableMap) {
    MIClient.productSearched(properties.toHashMap())
  }

  @ReactMethod
  fun productAdded(properties: ReadableMap) {
    MIClient.productAdded(properties.toHashMap())
  }

  @ReactMethod
  fun productViewed(properties: ReadableMap) {
    MIClient.productViewed(properties.toHashMap())
  }

  @ReactMethod
  fun orderCompleted(properties: ReadableMap) {
    MIClient.orderCompleted(properties.toHashMap())
  }

  @ReactMethod
  fun categoryViewed(properties: ReadableMap) {
    MIClient.categoryViewed(properties.toHashMap())
  }
  
  @ReactMethod
  fun productRemoved(properties: ReadableMap) {
    MIClient.productRemoved(properties.toHashMap())
  }

  @ReactMethod
  fun logEvent(name: String, properties: ReadableMap) {
    MIClient.logEvent(name, properties.toHashMap())
  }

  @ReactMethod
  fun checkPasteboardOnInstall(promise: Promise) {
    MIClient.checkPasteboardOnInstall { resolved ->
      promise.resolve(resolved)
    }
  }

  @ReactMethod
  fun showInAppMessage(url: String, callback: Callback) {
    currentActivity?.runOnUiThread {
      MIClient.showInAppBrowser(
        currentActivity!!,
        url,
        listener = object : MovableInAppClient.OnUrlLoadingListener {
            override fun onButtonClicked(value: String) {
              callback.invoke(value)
            }
        },
      )
    }
  }

  companion object {
    const val NAME = "RNMovableInk"
  }
}
