"use client";
import React, { useState } from "react";
import { Input, Button, Divider, Form, Upload, Row, Col, notification } from "antd";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { ref, set } from "firebase/database";
import { db } from "@/utils/firebase";

const FooterEditor: React.FC = () => {
  const [footerData, setFooterData] = useState({
    operationalHours: [
      { days: "Monday-Thursday", time: "10 AM - 8 PM" },
      { days: "Friday-Sunday", time: "10 AM - 9 PM" },
    ],
    contact: {
      name: "The Outlets",
      mobile: "0917 688 5387",
      email: "theoutlets@aboitiz.com",
    },
    socialMedia: {
      facebook: "outlets.com",
      instagram: "outlets.com",
      youtube: "outlets.com",
    },
    links: {
      leasingInfo: "",
      privacyStatement: "",
    },
    brand: {
      logo: "", // Will store the URL or base64 of the uploaded logo
      copyright: "2024 Outlets Venture | All rights reserved",
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleLogoUpload = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          setFooterData({
            ...footerData,
            brand: { ...footerData.brand, logo: e.target.result as string },
          });
        }
        setHasChanges(true); // Mark as changed
      };
      reader.readAsDataURL(file); // Convert file to Base64 URL
    }
  };

  const clearLogo = () => {
    setFooterData({
      ...footerData,
      brand: { ...footerData.brand, logo: "" },
    });
    setHasChanges(true); // Mark as changed
  };

  const handleSave = async () => {
    try {
      // Save each part of the footerData to Firebase
      await Promise.all(
        Object.entries(footerData).map(async ([key, value]) => {
          const footerRef = ref(db, `Settings/Footer/${key}`);
          await set(footerRef, value);
        })
      );

      notification.success({
        message: "Footer Saved",
        description: "The footer data has been successfully saved.",
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
      setHasChanges(false); // Reset change flag after saving
    } catch (error) {
      console.error("Error saving footer data:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Edit Footer</h2>
      <Divider />

      <Form layout="vertical">
        {/* Operational Hours */}
        <h3>Operational Hours</h3>
        <Row gutter={16}>
          {footerData.operationalHours.map((item, index) => (
            <Col span={12} key={index}>
              <Form.Item label={`Days (e.g., Monday-Thursday)`}>
                <Input
                  value={item.days}
                  onChange={(e) => {
                    setFooterData({
                      ...footerData,
                      operationalHours: footerData.operationalHours.map(
                        (hour, idx) =>
                          idx === index
                            ? { ...hour, days: e.target.value }
                            : hour
                      ),
                    });
                    setHasChanges(true); // Mark as changed
                  }}
                />
              </Form.Item>
              <Form.Item label="Time">
                <Input
                  value={item.time}
                  onChange={(e) => {
                    setFooterData({
                      ...footerData,
                      operationalHours: footerData.operationalHours.map(
                        (hour, idx) =>
                          idx === index
                            ? { ...hour, time: e.target.value }
                            : hour
                      ),
                    });
                    setHasChanges(true); // Mark as changed
                  }}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* Contact Information */}
        <h3>Contact Information</h3>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Name">
              <Input
                value={footerData.contact.name}
                onChange={(e) => {
                  setFooterData({
                    ...footerData,
                    contact: { ...footerData.contact, name: e.target.value },
                  });
                  setHasChanges(true); // Mark as changed
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Mobile Number">
              <Input
                value={footerData.contact.mobile}
                onChange={(e) => {
                  setFooterData({
                    ...footerData,
                    contact: { ...footerData.contact, mobile: e.target.value },
                  });
                  setHasChanges(true); // Mark as changed
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Email">
              <Input
                value={footerData.contact.email}
                onChange={(e) => {
                  setFooterData({
                    ...footerData,
                    contact: { ...footerData.contact, email: e.target.value },
                  });
                  setHasChanges(true); // Mark as changed
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Social Media Links */}
        <h3>Social Media Links</h3>
        <Row gutter={16}>
          {Object.entries(footerData.socialMedia).map(([platform, url]) => (
            <Col span={8} key={platform}>
              <Form.Item
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              >
                <Input
                  value={url}
                  onChange={(e) => {
                    setFooterData({
                      ...footerData,
                      socialMedia: {
                        ...footerData.socialMedia,
                        [platform]: e.target.value,
                      },
                    });
                    setHasChanges(true); // Mark as changed
                  }}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* Brand and Logo */}
        <h3>Brand and Logo</h3>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Upload Logo">
              <Upload
                name="logo"
                listType="picture"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleLogoUpload({ file });
                  return false; // Prevent automatic upload
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
              {footerData.brand.logo && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={footerData.brand.logo}
                    alt="Logo Preview"
                    style={{
                      width: "100px",
                      height: "auto",
                      borderRadius: "5px",
                      border: "1px solid #ddd",
                      padding: "5px",
                    }}
                  />
                  <Button
                    type="link"
                    onClick={clearLogo}
                    style={{ color: "red", marginLeft: "10px" }}
                  >
                    Clear Logo
                  </Button>
                </div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Copyright">
              <Input
                value={footerData.brand.copyright}
                onChange={(e) => {
                  setFooterData({
                    ...footerData,
                    brand: { ...footerData.brand, copyright: e.target.value },
                  });
                  setHasChanges(true); // Mark as changed
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Save Button and Change Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: hasChanges ? "red" : "green" }}>
            {hasChanges ? "Unsaved Changes" : "All Changes Saved"}
          </span>
          <Button
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "1px solid red",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Save Footer
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default FooterEditor;
