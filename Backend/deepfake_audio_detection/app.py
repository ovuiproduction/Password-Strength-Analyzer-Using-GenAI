import numpy as np
import librosa
import tensorflow as tf
import io


def extract_features_from_audio(audio_bytes, max_length=500, sr=16000, n_mfcc=40):
    try:
        # Convert bytes to audio array
        audio_array, _ = librosa.load(
            io.BytesIO(audio_bytes), 
            sr=sr
        )
        
        # Extract MFCC features
        mfccs = librosa.feature.mfcc(y=audio_array, sr=sr, n_mfcc=n_mfcc)
        
        # Pad or trim the feature array to a fixed length
        if mfccs.shape[1] < max_length:
            mfccs = np.pad(mfccs, ((0, 0), (0, max_length - mfccs.shape[1])), mode='constant')
        else:
            mfccs = mfccs[:, :max_length]
        
        # Reshape to match model input
        mfccs = mfccs.reshape(1, mfccs.shape[0], mfccs.shape[1], 1)
        
        return mfccs
    except Exception as e:
        return None
    
    
def load_model():
    try:
        model = tf.keras.models.load_model("D:/Projects/Password-Strength-Analysis-Using-GenAI/Backend/deepfake_audio_detection/my_model.h5")
        return model
    except Exception as e:
        return None
    

def analyze_audio(uploaded_file):
    model = load_model()
    if model is not None:
        # Extract features
        features = extract_features_from_audio(uploaded_file.getvalue())
        
        if features is not None:
            # Make prediction
            prediction = model.predict(features)
            confidence = round(float(prediction[0][0]),2)
            
            # Determine result
            is_deepfake = bool(confidence > 0.5)
            confidence = confidence*100
            status = 200
            return status,{"is_deepfake":is_deepfake,"confidence":confidence}
        
        status = 500
        return status,{"error":"Features not extracted"}
    
    status=500     
    return status,{"error":"Model Not Found"}


