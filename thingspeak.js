/*
    HTTP webclient code that sends data to ThingSpeak.com using up to 3 sensors.
    
    CREDITS: Original code by Leonardo Gonçalves - Instituto Nacional de Telecomunicações INATEL - Brazil
    EDITS: By Timothy Woo, Stephane Come
*/

#include <ESP8266WiFi.h>

const char* ssid     = "your_wifi_network";   // replace with your WiFi network name
const char* password = "your_wifi_password";  // replace iwth your WiFi password
String pubString;

// Set your computer IP address
const char* host = "api.thingspeak.com";
const int httpPort = 80;                      // the port number

// Set your ThinkSpeak.com variables
String write_api_key = "write_api_key";       // the key assigned by ThingSpeak.com

int sensor_pin = A0;    // Set  pin you are using to read data. In this case it's analog for reading pH values
float value = 0;        // Initialize the value you are going to read
const int sleepTimeS = 1*10; // Set sleep time in seconds for the deep sleep cycle

long sensor1 = 0;    // rain sensor value
long sensor2 = 0;    // moisture sensor value
long sensor3 = 0;    // light sensor value

void setup() {

  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);          // for debug - open the console log to see the information
  delay(100);

  // We start by connecting to the local WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  pinMode(0, OUTPUT);  // set D0 as output pin
  pinMode(2, OUTPUT);  // set D3 as output pin
  pinMode(16, OUTPUT); // set D4 as output pin

  pinMode(12,OUTPUT);  // RGB output pin
  pinMode(13,OUTPUT);  // RGB output pin
  pinMode(14,OUTPUT);  // RGB output pin
  
  WiFi.begin(ssid, password);  // Connect to the local WiFi network

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
  }

  // Check your console log to see these messages.
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP()); // This is your NodeMCU IP address. Could be handy for other projects
}

void loop()
{
  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW

  GET();  // Send a GET request for testing
  digitalWrite(LED_BUILTIN, HIGH);   // turn the LED off by making the voltage LOW
  delay(15000);  // Wait 15 seconds. Your free ThingSpeak.com account only allows 1 call every 15 seconds.
}

// function to send the sensor data to ThingSpeak.com
void GET(void)
{
  int state_pos;
  String state;

  // Blink the RGB colors
  digitalWrite(12,HIGH);
  delay(500);
  digitalWrite(12,LOW);
  digitalWrite(14,HIGH);
  delay(500);
  digitalWrite(14,LOW);
  digitalWrite(13,HIGH);
  delay(500);
  digitalWrite(13,LOW);
  
  // Activate the rain sensor and record the value
  digitalWrite(0, HIGH);
  digitalWrite(2, LOW);
  digitalWrite(16, LOW);
  delay(100);
  sensor1 = analogRead(sensor_pin); // Read sensor value
  Serial.print("sensor1=");
  Serial.print(sensor1);
  delay(100);
  
  // Activate the moisture sensor and record the value
  digitalWrite(0, LOW);
  digitalWrite(2, HIGH);
  sensor2 = analogRead(sensor_pin); // Read sensor value
  digitalWrite(16, LOW);
  delay(100);
  Serial.print(", sensor2=");
  Serial.print(sensor2);
  
  // Activate the light sensor and record the value
  digitalWrite(2, LOW);
  digitalWrite(16, HIGH);
  delay(100);
  sensor3 = analogRead(sensor_pin); // Read sensor value
  digitalWrite(16, LOW);
  Serial.print(", sensor3=");
  Serial.println(sensor3);
  delay(100);
  
  // sending the data to ThingSpeak.com
  Serial.print("connecting to ");
  Serial.println(host);
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }

  // We now create a URI for the request
  Serial.print("Requesting GET: ");
  // This will send the request to the server
  Serial.println("GET /update?api_key=" + write_api_key + "&field1=" + String(sensor1) + " HTTP/1.1");
  client.println("GET /update?api_key=" + write_api_key + "&field1=" + String(sensor1) + "&field2=" + String(sensor2) + "&field3=" + String(sensor3) + " HTTP/1.1");
  client.print("Host: ");
  client.println(host);
  client.println("Connection: close");
  client.println();
  delay(500);
  
  // Read all the lines of the reply from server and print them to Serial
  while (client.available()) {
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  Serial.println("closing connection");
}
