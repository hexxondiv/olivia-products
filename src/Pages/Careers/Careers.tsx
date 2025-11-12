import React from "react";
import "./careers.scss";

export const Careers = () => {
  return (
    <div className="home-div">
      <div className="careers-landing">
        <h1 className="col-md-4 offset-md-2">Join Our Team</h1>
      </div>
      
      <div className="careers-content">
        <div className="col-md-8 offset-md-2">
          <div className="careers-intro">
            <h2>Build Your Career with Olivia Products</h2>
            <p>
              At Olivia Products, we believe in fostering talent, encouraging innovation, 
              and creating opportunities for growth. As one of Nigeria's leading manufacturers 
              of consumer care products, we offer a dynamic work environment where your skills 
              and dedication can make a real impact.
            </p>
          </div>

          <div className="careers-benefits">
            <h3>Why Work With Us?</h3>
            <div className="row row-cols-1 row-cols-md-2 g-4">
              <div className="col">
                <div className="benefit-card">
                  <h4>Growth Opportunities</h4>
                  <p>
                    We invest in our employees' professional development through training 
                    programs and career advancement opportunities.
                  </p>
                </div>
              </div>
              <div className="col">
                <div className="benefit-card">
                  <h4>Competitive Benefits</h4>
                  <p>
                    Enjoy competitive salaries, health insurance, and other benefits designed 
                    to support your well-being and work-life balance.
                  </p>
                </div>
              </div>
              <div className="col">
                <div className="benefit-card">
                  <h4>Innovative Environment</h4>
                  <p>
                    Work with cutting-edge technology and processes in a company that values 
                    innovation and continuous improvement.
                  </p>
                </div>
              </div>
              <div className="col">
                <div className="benefit-card">
                  <h4>Team Culture</h4>
                  <p>
                    Join a diverse, inclusive team that values collaboration, respect, and 
                    mutual support in achieving common goals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="careers-openings">
            <h3>Current Openings</h3>
            <p>
              We're always looking for talented individuals to join our team. While we may 
              not have specific positions listed at the moment, we welcome applications from 
              passionate professionals across various departments including:
            </p>
            <ul className="departments-list">
              <li>Manufacturing & Production</li>
              <li>Quality Assurance & Control</li>
              <li>Sales & Marketing</li>
              <li>Research & Development</li>
              <li>Supply Chain & Logistics</li>
              <li>Human Resources</li>
              <li>Finance & Accounting</li>
              <li>Information Technology</li>
            </ul>
          </div>

          <div className="careers-apply">
            <h3>How to Apply</h3>
            <p>
              Interested in joining our team? Send your resume and cover letter to:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> <a href="mailto:careers@celineolivia.com">careers@celineolivia.com</a></p>
              <p><strong>Subject Line:</strong> Career Application - [Your Name]</p>
              <p>
                Please include your resume, cover letter, and specify the position or department 
                you're interested in. Our HR team will review your application and contact you 
                if there's a suitable opportunity.
              </p>
            </div>
          </div>

          <div className="careers-note">
            <p>
              <strong>Note:</strong> Olivia Products is an equal opportunity employer. We celebrate 
              diversity and are committed to creating an inclusive environment for all employees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

