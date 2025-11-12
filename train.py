import pandas as pd, joblib, json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# --- Step 1: Load dataset ---
csv_path = 'data/disease_dataset.csv'
df = pd.read_csv(csv_path)

# --- Step 2: Data preprocessing ---
df['gender_male'] = (df['gender'] == 'M').astype(int)
features = ['age', 'gender_male'] + [c for c in df.columns if c not in ('id', 'age', 'gender', 'disease')]
X, y = df[features], df['disease']

# Encode target labels
le = LabelEncoder()
y_enc = le.fit_transform(y)

# --- Step 3: Split data ---
X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)

# --- Step 4: Train multiple models ---
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression

models = {
    "RandomForest": RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42),
    "DecisionTree": DecisionTreeClassifier(random_state=42),
    "LogisticRegression": LogisticRegression(max_iter=1000)
}

results = {}

# --- Step 5: Train, evaluate, and save each model ---
for name, model in models.items():
    print(f"\n🔹 Training {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"{name} Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    # Save model
    joblib.dump(model, f"model/{name.lower()}_model.pkl")
    results[name] = acc

# --- Step 6: Save metadata ---
json.dump(features, open('model/cols.json', 'w'))
json.dump({'classes': list(le.classes_)}, open('model/label_map.json', 'w'))

# --- Step 7: Print comparison ---
print("\n✅ Training completed! Model accuracy comparison:")
for name, acc in results.items():
    print(f"{name}: {acc:.4f}")

best_model = max(results, key=results.get)
print(f"\n🏆 Best model: {best_model} (Accuracy: {results[best_model]:.4f})")