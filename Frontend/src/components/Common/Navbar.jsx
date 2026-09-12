import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';

function Navbar() {
  return (
    <BootstrapNavbar expand="lg" className="navbar-veloop">
      <Container className="container-shell">
        <BootstrapNavbar.Brand href="#" className="fw-bold text-white">
          VELOOP
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-3">
            <Nav.Link href="#featured" className="text-white-50">Featured</Nav.Link>
            <Nav.Link href="#winners" className="text-white-50">Winners</Nav.Link>
            <Nav.Link href="#faq" className="text-white-50">FAQ</Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
