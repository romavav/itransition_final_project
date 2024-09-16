import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import Moment from "moment";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [formData, setFormData] = useState({
    displayName: "",
    dateOfBirth: new Date(),
    phone: "",
    country: "",
    age: 0,
    email: "",
  });
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  // Fetching user data when the component loads
  useEffect(() => {
    const fetchData = async () => {
      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);

        // If user data exists, then set the form data
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({ ...userData, email: authUser.email, displayName: authUser.displayName || "" });
          const age = calculateAge(userData.dateOfBirth);
          setFormData((prevState) => ({ ...prevState, age: age }));
        }
      }
    };

    fetchData();
  }, [authUser]);

  // Handling input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Saving changes to Firestore
  const handleSaveChanges = async () => {
    setEditMode(false);

    const userDocRef = doc(db, "users", authUser.uid);
    await updateDoc(userDocRef, formData);

    // Update displayName in auth profile
    if (authUser) {
      await updateProfile(authUser, {
        displayName: formData.displayName,
      });
    }
  };

  // Fetch user data when component loads
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    };

    fetchUser();
  }, []);

  // Save user data to Firestore
  const saveUserDataToFirestore = async (user) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const userData = {
        displayName: user.displayName || "",
        email: user.email || "",
        dateOfBirth: user.metadata.dateOfBirth || "",
        phone: "",
        country: "",
        age: calculateAge(user.metadata.creationTime),
      };

      await setDoc(userDocRef, userData);
    }
  };

  // Calculate user age
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Sign out user
  const userSignOut = () => {
    signOut(auth)
      .then(() => navigate("/"))
      .catch((error) => console.log(error));
  };

  // Manage auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        saveUserDataToFirestore(user);
      } else {
        setAuthUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mt-3">
      {authUser ? (
        <Card>
          <Card.Body>
            <Card.Title>{`Профиль: ${authUser.email}`}</Card.Title>
            {editMode ? (
              <Form>
                <Form.Control
                  className="mb-2"
                  type="text"
                  name="displayName"
                  placeholder="Имя"
                  value={formData.displayName}
                  onChange={handleInputChange}
                />
                <Form.Control
                  className="mb-2"
                  type="date"
                  name="dateOfBirth"
                  placeholder="Дата рождения"
                  value={Moment(formData.dateOfBirth).format("YYYY-MM-DD")}
                  onChange={handleInputChange}
                />
                <Form.Control
                  className="mb-2"
                  type="text"
                  name="phone"
                  placeholder="Номер телефона"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <Form.Control
                  className="mb-2"
                  type="text"
                  name="country"
                  placeholder="Страна"
                  value={formData.country}
                  onChange={handleInputChange}
                />
                <Button className="mt-2" onClick={handleSaveChanges}>
                  Сохранить
                </Button>
              </Form>
            ) : (
              <div>
                <p>Имя: {formData.displayName}</p>
                <p>Возраст: {formData.age} лет</p>
                <p>Номер телефона: {formData.phone}</p>
                <p>Страна: {formData.country}</p>
                <Button className="me-2" onClick={() => setEditMode(true)}>
                  Редактировать
                </Button>
                <Button onClick={userSignOut}>Выйти</Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div>
          <p>Пожалуйста, войдите в систему.</p>
          <Button onClick={() => navigate("/login")}>Войти</Button>
        </div>
      )}
    </div>
  );
};

export default AuthDetails;